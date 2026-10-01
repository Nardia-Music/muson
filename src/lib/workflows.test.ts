import { describe, expect, it } from "vitest";
import {
  createSeed,
  checkpoint,
  transition,
  config,
  eligible,
  type State,
} from "./workflows";

function registered() {
  let state = createSeed();
  state = transition(state, {
    type: "register",
    grade: 5,
    subject: "Piano",
    kinds: ["theory", "practical"],
  });
  return transition(state, { type: "pay" });
}

describe("exam lifecycle", () => {
  it("distinguishes a missing birth date from a minor and accepts the eighteenth birthday", () => {
    const state = registered();
    state.profile.birthDate = "";
    expect(() => transition(state, { type: "submit-video", id: "ada-practical", file: "sample", declaration: true })).toThrow(/date of birth/);
    state.profile.birthDate = "2008-12-03";
    expect(transition(state, { type: "submit-video", id: "ada-practical", file: "sample", declaration: true }).registrations.find(item => item.id === "ada-practical")?.file).toBe("sample");
  });
  it("locks expired answers and blocks demo-clock changes during an attempt", () => {
    let state = registered();
    state = transition(state, { type: "start-theory", id: "ada-theory", now: 1000 });
    const attempt = state.registrations.find(item => item.id === "ada-theory")!.attempt!;
    expect(() => transition(state, { type: "answer", id: "ada-theory", now: attempt.questionDeadline, answer: attempt.options[attempt.order[0]][0] })).toThrow(/timed out/);
    expect(() => transition(state, { type: "advance", days: 4 })).toThrow(/active theory/);
    state = transition(state, { type: "next-question", id: "ada-theory", now: attempt.questionDeadline });
    expect(state.registrations.find(item => item.id === "ada-theory")!.attempt!.index).toBe(1);
  });
  it("requires a named guardian for a minor and marks missed uploads absent", () => {
    let state = registered();
    state.profile.birthDate = "2012-02-10";
    expect(() => transition(state, { type: "submit-video", id: "ada-practical", file: "sample", declaration: true })).toThrow(/guardian/);
    state = transition(state, { type: "advance", days: 30 });
    expect(state.registrations.find(item => item.id === "ada-practical")!.status).toBe("absent");
  });
  it("rejects out-of-range marks and keeps referred results held", () => {
    let state = createSeed();
    state.role = "examiner";
    expect(() => transition(state, { type: "mark", id: "maya-practical", marks: [31, 20, 20, 8], comments: "Test mark", draft: false })).toThrow(/limits/);
    state.role = "admin";
    state = transition(state, { type: "integrity", id: "kehinde-theory", decision: "referred", note: "Further review required" });
    state = transition(state, { type: "publish" });
    expect(state.registrations.every(item => !item.result)).toBe(true);
  });
  it("requires payment and verified prerequisites", () => {
    const state = createSeed();
    expect(() =>
      transition(state, {
        type: "register",
        grade: 7,
        subject: "Piano",
        kinds: ["practical"],
      }),
    ).toThrow(/Grade 5/);
    const unpaid = transition(state, {
      type: "register",
      grade: 5,
      subject: "Piano",
      kinds: ["theory"],
    });
    expect(() =>
      transition(unpaid, { type: "start-theory", id: "ada-theory", now: 1000 }),
    ).toThrow(/payment/i);
  });
  it("makes payment idempotent", () => {
    const state = registered();
    expect(transition(state, { type: "pay" }).payments).toHaveLength(1);
    expect(
      state.registrations
        .filter((item) => item.candidateId === "ada")
        .every((item) => item.paid),
    ).toBe(true);
  });
  it("persists the attempt and marks unanswered questions zero on expiry", () => {
    let state = registered();
    state = transition(state, {
      type: "start-theory",
      id: "ada-theory",
      now: 1000,
    });
    const deadline = state.registrations.find(
      (item) => item.id === "ada-theory",
    )!.attempt!.deadline;
    expect(
      transition(state, {
        type: "start-theory",
        id: "ada-theory",
        now: 2000,
      }).registrations.find((item) => item.id === "ada-theory")!.attempt!
        .deadline,
    ).toBe(deadline);
    state = transition(state, {
      type: "submit-theory",
      id: "ada-theory",
      now: deadline,
    });
    const registration = state.registrations.find(
      (item) => item.id === "ada-theory",
    )!;
    expect(registration.scores[0].total).toBe(0);
    expect(eligible(registration)).toBe(false);
    expect(
      transition(state, {
        type: "submit-theory",
        id: "ada-theory",
        now: deadline,
      }).registrations.find((item) => item.id === "ada-theory")!.scores,
    ).toHaveLength(1);
  });
  it("requires declaration and prevents late or repeated practical uploads", () => {
    let state = registered();
    expect(() =>
      transition(state, {
        type: "submit-video",
        id: "ada-practical",
        file: "sample",
        declaration: false,
      }),
    ).toThrow(/declaration/i);
    state = transition(state, {
      type: "submit-video",
      id: "ada-practical",
      file: "sample",
      declaration: true,
    });
    expect(() =>
      transition(state, {
        type: "submit-video",
        id: "ada-practical",
        file: "sample",
        declaration: true,
      }),
    ).toThrow(/already/i);
    const late = { ...registered(), now: Date.parse(config.sitting.closesAt) };
    expect(() =>
      transition(late, {
        type: "submit-video",
        id: "ada-practical",
        file: "sample",
        declaration: true,
      }),
    ).toThrow(/closed/i);
  });
  it("holds unresolved integrity reviews and delays certificate issuance", () => {
    let state = createSeed();
    expect(
      eligible(
        state.registrations.find((item) => item.id === "kehinde-theory")!,
      ),
    ).toBe(false);
    state = transition(state, { type: "role", role: "admin" });
    state = transition(state, {
      type: "integrity",
      id: "kehinde-theory",
      decision: "cleared",
      note: "Reviewed the evidence",
    });
    state = transition(state, { type: "publish" });
    expect(() =>
      transition(state, { type: "issue", id: "kehinde-theory" }),
    ).toThrow(/days/i);
    state = transition(state, { type: "advance", days: 4 });
    state = transition(state, { type: "issue", id: "kehinde-theory" });
    expect(state.certificates).toHaveLength(1);
    expect(
      transition(state, { type: "issue", id: "kehinde-theory" }).certificates,
    ).toHaveLength(1);
  });
  it("requires a different examiner on appeal and supersedes old certificates", () => {
    let state: State = registered();
    state = transition(state, {
      type: "submit-video",
      id: "ada-practical",
      file: "sample",
      declaration: true,
    });
    state = transition(state, { type: "role", role: "examiner" });
    state = transition(state, {
      type: "mark",
      id: "ada-practical",
      marks: [20, 20, 20, 8],
      comments: "Good phrasing",
      draft: false,
    });
    state = transition(state, { type: "role", role: "admin" });
    state = transition(state, { type: "publish" });
    state = transition(state, { type: "advance", days: 4 });
    state = transition(state, { type: "issue", id: "ada-practical" });
    state = transition(state, { type: "role", role: "candidate" });
    state = transition(state, {
      type: "appeal",
      id: "ada-practical",
      reason: "Please review the interpretation marks.",
    });
    state = transition(state, { type: "role", role: "examiner" });
    expect(() =>
      transition(state, {
        type: "mark",
        id: "ada-practical",
        marks: [24, 24, 24, 8],
        comments: "Second review",
        draft: false,
      }),
    ).toThrow(/different/i);
    state = transition(state, { type: "role", role: "examiner-2" });
    state = transition(state, {
      type: "mark",
      id: "ada-practical",
      marks: [24, 24, 24, 8],
      comments: "Second review",
      draft: false,
    });
    state = transition(state, { type: "role", role: "admin" });
    state = transition(state, { type: "resolve-appeal", id: "ada-practical" });
    expect(state.certificates[0].status).toBe("superseded");
    expect(
      state.registrations.find((item) => item.id === "ada-practical")!.scores,
    ).toHaveLength(2);
  });
});

describe("Diploma admissions", () => {
  it("seeds a useful queue and exposes Diploma and appeal rehearsal checkpoints", () => {
    expect(createSeed().applications).toHaveLength(7);
    expect(checkpoint("diploma").applications[0].status).toBe("submitted");
    expect(checkpoint("appeal").appeals[0].status).toBe("awaiting second mark");
  });
  function submitted() {
    let state = createSeed();
    state.role = "candidate";
    const application = structuredClone(state.applications[0]);
    application.documents.forEach(document => { document.file = `sample-${document.id}`; });
    state = transition(state, { type: "save-application", application });
    return transition(state, { type: "submit-application", id: application.id });
  }
  it("enforces qualifications and missing documents", () => {
    const state = createSeed(); state.role = "candidate";
    expect(() => transition(state, { type: "submit-application", id: "ada-diploma" })).toThrow(/documents/);
    state.applications[0].sittings = 3;
    expect(() => transition(state, { type: "submit-application", id: "ada-diploma" })).toThrow(/two sittings/);
    state.applications[0].sittings = 1; state.applications[0].english = false;
    expect(() => transition(state, { type: "submit-application", id: "ada-diploma" })).toThrow(/English/);
  });
  it("derives credit totals from entered subject grades", () => {
    const state = createSeed();
    state.role = "candidate";
    const application = structuredClone(state.applications[0]);
    application.subjectGrades![0].grade = "D7";
    const updated = transition(state, { type: "save-application", application }).applications[0];
    expect(updated.credits).toBe(4);
    expect(updated.english).toBe(false);
  });
  it("retains unchanged verification and charges only once on replacement", () => {
    let state = submitted(); state.role = "admin";
    state = transition(state, { type: "document", id: "ada-diploma", documentId: "doc-1", status: "verified", note: "Verified original" });
    state = transition(state, { type: "document", id: "ada-diploma", documentId: "doc-0", status: "rejected", note: "Unreadable scan" });
    expect(state.applications[0].status).toBe("needs info");
    state = transition(state, { type: "review-application", id: "ada-diploma", status: "needs info", note: "Replace results scan" });
    state.role = "candidate";
    const application = structuredClone(state.applications[0]); application.documents[0].file = "sample-replacement";
    state = transition(state, { type: "save-application", application });
    state = transition(state, { type: "submit-application", id: "ada-diploma" });
    expect(state.applications[0].documents[0].status).toBe("pending");
    expect(state.applications[0].documents[0].note).toBe("Unreadable scan");
    expect(state.applications[0].documents[1].status).toBe("verified");
    expect(state.payments).toHaveLength(1);
  });
  it("requires verification and enforces slot capacity and single assignment", () => {
    let state = submitted(); state.role = "admin";
    expect(() => transition(state, { type: "review-application", id: "ada-diploma", status: "shortlisted", note: "" })).toThrow(/Verify all/);
    for (const document of state.applications[0].documents) state = transition(state, { type: "document", id: "ada-diploma", documentId: document.id, status: "verified", note: "Checked" });
    state = transition(state, { type: "review-application", id: "ada-diploma", status: "shortlisted", note: "Welcome" });
    state = transition(state, { type: "create-slot", slot: { date: "2026-12-12T09:00:00Z", venue: "MUSON Centre", capacity: 1, mode: "In person" } });
    expect(() => transition(state, { type: "schedule", slotId: state.slots[0].id, applicationIds: ["ada-diploma", "other"] })).toThrow(/capacity/);
    state = transition(state, { type: "schedule", slotId: state.slots[0].id, applicationIds: ["ada-diploma"] });
    expect(state.applications[0].status).toBe("audition scheduled");
    expect(() => transition(state, { type: "schedule", slotId: state.slots[0].id, applicationIds: ["ada-diploma"] })).toThrow();
    expect(state.profile.prerequisite).toBe(true);
  });
});
