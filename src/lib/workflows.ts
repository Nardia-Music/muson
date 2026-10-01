import { z } from "zod";
import { questions, shuffle } from "./questions";

export const DAY = 86_400_000;
export const dateTime = (value: number | string) => `${new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(new Date(value))} WAT`;
export const config = {
  id: "muson",
  name: "Musical Society of Nigeria",
  shortName: "MUSON",
  subjects: [
    "Piano",
    "Voice",
    "Violin",
    "Clarinet",
    "Saxophone",
    "Flute",
    "Trumpet",
    "Percussion",
    "Guitar",
  ],
  levels: Array.from({ length: 9 }, (_, index) => index),
  prerequisiteFrom: 6,
  prerequisiteLevel: 5,
  passMark: 50,
  certificateDelayDays: 4,
  appealDays: 7,
  theoryMinutes: 12,
  questionSeconds: 60,
  fees: { theory: 1500000, practical: 2500000, application: 1000000 },
  acceptedBodies: ["MUSON", "ABRSM", "Trinity"],
  rubric: [
    { name: "Piece 1: accuracy & fluency", max: 30 },
    { name: "Piece 2: musical interpretation", max: 30 },
    { name: "Piece 3: technique & control", max: 30 },
    { name: "Overall performance", max: 10 },
  ],
  sitting: {
    id: "dec-2026",
    name: "December 2026",
    opensAt: "2026-12-01T00:00:00Z",
    closesAt: "2026-12-31T00:00:00Z",
  },
};
export type Role =
  "visitor" | "candidate" | "admin" | "examiner" | "examiner-2";
type Owned = { id: string; institutionId: string };
export type Profile = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  guardian: string;
  photo?: string;
  prerequisite: boolean;
};
export type Attempt = {
  order: string[];
  options: Record<string, string[]>;
  answers: Record<string, string>;
  index: number;
  deadline: number;
  questionDeadline: number;
  submitted: boolean;
};
export type Score = Owned & {
  examiner: string;
  marks: number[];
  total: number;
  comments: string;
  submittedAt: number;
};
export type Registration = Owned & {
  candidateId: string;
  candidate: string;
  sittingId: string;
  kind: "theory" | "practical";
  subject: string;
  grade: number;
  paid: boolean;
  assignedTo: string;
  code: string;
  status: "registered" | "in progress" | "submitted" | "graded" | "absent";
  attempt?: Attempt;
  file?: string;
  fileName?: string;
  declared?: boolean;
  submittedAt?: number;
  scores: Score[];
  draft?: { examiner: string; marks: number[]; comments: string };
  integrity: "pending" | "flagged" | "cleared" | "referred";
  events: string[];
  reviewNote?: string;
  clearedAt?: number;
  result?: { total: number; publishedAt: number; version: number };
};
export type Certificate = Owned & {
  registrationId: string;
  number: string;
  candidate: string;
  exam: string;
  grade: number;
  mark: number;
  issuedAt: number;
  status: "valid" | "cancelled" | "superseded";
};
export type Appeal = Owned & {
  registrationId: string;
  reason: string;
  status: "awaiting second mark" | "awaiting approval" | "resolved";
  createdAt: number;
  outcome?: string;
};
export type DocumentRecord = Owned & {
  label: string;
  file?: string;
  name?: string;
  status: "missing" | "pending" | "verified" | "rejected";
  note: string;
};
export type Application = Owned & {
  candidateId: string;
  name: string;
  instrument: string;
  status:
    | "draft"
    | "submitted"
    | "under review"
    | "needs info"
    | "shortlisted"
    | "rejected"
    | "audition scheduled";
  sittings: number;
  credits: number;
  english: boolean;
  subjectGrades?: { subject: string; grade: string; sitting: number }[];
  theoryLevel: number;
  practicalLevel: number;
  body: string;
  paid: boolean;
  documents: DocumentRecord[];
  note: string;
  slotId?: string;
};
export type Slot = Owned & {
  date: string;
  venue: string;
  mode: "In person" | "Video";
  capacity: number;
  applicationIds: string[];
};
export type State = {
  role: Role;
  now: number;
  profile: Profile;
  registrations: Registration[];
  certificates: Certificate[];
  appeals: Appeal[];
  applications: Application[];
  slots: Slot[];
  payments: (Owned & {
    amount: number;
    reference: string;
    createdAt: number;
  })[];
  notifications: (Owned & { text: string; createdAt: number })[];
};

export type Action =
  | { type: "role"; role: Role }
  | { type: "advance"; days: number }
  | { type: "profile"; profile: Profile }
  | {
      type: "register";
      grade: number;
      subject: string;
      kinds: Registration["kind"][];
    }
  | { type: "pay" }
  | { type: "start-theory"; id: string; now: number }
  | { type: "answer"; id: string; answer: string; now: number }
  | { type: "next-question" | "submit-theory"; id: string; now: number }
  | { type: "flag"; id: string; reason: string }
  | {
      type: "submit-video";
      id: string;
      file: string;
      fileName?: string;
      declaration: boolean;
    }
  | {
      type: "mark";
      id: string;
      marks: number[];
      comments: string;
      draft: boolean;
    }
  | {
      type: "integrity";
      id: string;
      decision: "cleared" | "referred";
      note: string;
    }
  | { type: "publish" }
  | { type: "issue" | "cancel-certificate"; id: string }
  | { type: "appeal"; id: string; reason: string }
  | { type: "resolve-appeal"; id: string }
  | { type: "save-application"; application: Application }
  | { type: "submit-application"; id: string }
  | {
      type: "document";
      id: string;
      documentId: string;
      status: "verified" | "rejected";
      note: string;
    }
  | {
      type: "review-application";
      id: string;
      status: Application["status"];
      note: string;
    }
  | {
      type: "create-slot";
      slot: Omit<Slot, "id" | "institutionId" | "applicationIds">;
    }
  | { type: "schedule"; slotId: string; applicationIds: string[] };

const owned = (id: string): Owned => ({ id, institutionId: config.id });
const freshId = () => crypto.randomUUID();
export const level = (grade: number) =>
  grade === 0 ? "Prelim" : `Grade ${grade}`;
export const money = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount / 100);
export const date = (value: number | string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
export const title = (entry: Registration) =>
  `${level(entry.grade)} ${entry.kind === "theory" ? "Music Theory" : `${entry.subject} Practical`}`;
export const eligible = (entry: Registration) =>
  entry.paid &&
  entry.scores.length > 0 &&
  (entry.kind === "practical" || entry.integrity === "cleared");

function registration(
  candidateId: string,
  candidate: string,
  kind: Registration["kind"],
  grade = 5,
  subject = "Piano",
): Registration {
  return {
    ...owned(`${candidateId}-${kind}`),
    candidateId,
    candidate,
    sittingId: config.sitting.id,
    kind,
    subject,
    grade,
    paid: false,
    assignedTo: "examiner",
    code: candidateId === "ada" ? "MUSON-ADA-2026" : `MUSON-${candidateId.toUpperCase()}-2026`,
    status: "registered",
    scores: [],
    integrity: "pending",
    events: [],
  };
}

export function createSeed(): State {
  const now = Date.parse("2026-12-03T10:00:00Z");
  const background = registration("kehinde", "Kehinde Bello", "theory");
  Object.assign(background, {
    paid: true,
    status: "graded",
    integrity: "flagged",
    events: [
      "3 Dec 2026, 11:03 WAT - Window lost focus during question 8 (seeded scenario)",
      "3 Dec 2026, 11:04 WAT - Window lost focus again (seeded scenario)",
      "3 Dec 2026, 11:00 WAT - Simulated readiness check completed",
    ],
    scores: [
      {
        ...owned("seed-score"),
        examiner: "automatic",
        marks: [78],
        total: 78,
        comments: "Automatically marked",
        submittedAt: now,
      },
    ],
  });
  const practical = registration(
    "maya",
    "Maya Adeyemi",
    "practical",
    3,
    "Violin",
  );
  Object.assign(practical, {
    paid: true,
    status: "submitted",
    file: "sample",
    fileName: "Sample performance.mp4",
    declared: true,
    submittedAt: now,
  });
  const state: State = {
    role: "visitor",
    now,
    profile: {
      name: "Ada Okafor",
      email: "ada@example.com",
      phone: "08000000000",
      birthDate: "2004-05-12",
      guardian: "",
      prerequisite: false,
    },
    registrations: [background, practical],
    certificates: [],
    appeals: [],
    payments: [],
    slots: [],
    applications: [
      {
        ...owned("ada-diploma"),
        candidateId: "ada",
        name: "Ada Okafor",
        instrument: "Piano",
        status: "draft",
        sittings: 1,
        credits: 5,
        english: true,
        subjectGrades: ["English Language", "Mathematics", "Literature in English", "Music", "Government"].map(subject => ({ subject, grade: "B3", sitting: 1 })),
        theoryLevel: 5,
        practicalLevel: 5,
        body: "MUSON",
        paid: false,
        note: "",
        documents: [
          "SSCE results",
          "Grade 5 theory certificate",
          "Grade 5 practical certificate",
          "Passport photo",
        ].map((label, index) => ({
          ...owned(`doc-${index}`),
          label,
          status: "missing",
          note: "",
        })),
      },
    ],
    notifications: [
      {
        ...owned("welcome"),
        text: "December 2026 entries are open. Your musical journey continues.",
        createdAt: now,
      },
    ],
  };
  const applicants: [string, string, Application["status"]][] = [
    ["Chinwe Eze", "Voice", "submitted"], ["Daniel Akinola", "Violin", "under review"],
    ["Fatima Yusuf", "Piano", "needs info"], ["Emeka Nwosu", "Trumpet", "shortlisted"],
    ["Zainab Ibrahim", "Flute", "shortlisted"], ["Samuel Peters", "Guitar", "rejected"],
  ];
  applicants.forEach(([name, instrument, status], index) => {
    const application = structuredClone(state.applications[0]);
    Object.assign(application, { id: `applicant-${index + 2}`, candidateId: `applicant-${index + 2}`, name, instrument, status, paid: true, note: status === "needs info" ? "Please replace the unreadable SSCE scan." : status === "rejected" ? "Entry requirements not met for this intake." : "" });
    application.documents = application.documents.map((document, position) => ({ ...document, id: `${application.id}-doc-${position}`, file: "sample", name: `Sample ${document.label}.pdf`, status: status === "shortlisted" ? "verified" : status === "needs info" && position === 0 ? "rejected" : "pending", note: status === "needs info" && position === 0 ? "Please replace the unreadable scan." : "" }));
    state.applications.push(application);
  });
  return state;
}

function requireCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}
function notify(state: State, text: string) {
  state.notifications.unshift({
    ...owned(freshId()),
    text,
    createdAt: state.now,
  });
  state.notifications = state.notifications.slice(0, 30);
}
function finish(entry: Registration, state: State) {
  const attempt = entry.attempt!;
  if (attempt.submitted) return;
  const marks = attempt.order.map((id) =>
    questions.find((question) => question.id === id)!.correct ===
    attempt.answers[id]
      ? 1
      : 0,
  );
  const total = Math.round(
    (marks.reduce<number>((sum, mark) => sum + mark, 0) / marks.length) * 100,
  );
  attempt.submitted = true;
  entry.status = "graded";
  entry.submittedAt = state.now;
  entry.scores = [
    {
      ...owned(freshId()),
      examiner: "automatic",
      marks,
      total,
      comments: "Provisional score. Integrity review pending.",
      submittedAt: state.now,
    },
  ];
  notify(
    state,
    `${entry.candidate}: ${title(entry)} submitted. Provisional score ${total}%.`,
  );
}

export function transition(previous: State, action: Action): State {
  const state = structuredClone(previous);
  const entry =
    "id" in action
      ? state.registrations.find((item) => item.id === action.id)
      : undefined;
  const application =
    "id" in action
      ? state.applications.find((item) => item.id === action.id)
      : undefined;
  const adminActions = [
    "integrity",
    "publish",
    "issue",
    "cancel-certificate",
    "resolve-appeal",
    "document",
    "review-application",
    "create-slot",
    "schedule",
  ];
  const candidateActions = [
    "register",
    "pay",
    "start-theory",
    "answer",
    "next-question",
    "submit-theory",
    "submit-video",
    "appeal",
    "profile",
    "save-application",
    "submit-application",
  ];
  if (adminActions.includes(action.type))
    requireCondition(
      state.role === "admin",
      "Switch to the admin role to continue.",
    );
  if (candidateActions.includes(action.type)) {
    requireCondition(
      state.role === "candidate" ||
        (state.role === "visitor" && action.type === "register"),
      "Switch to the candidate role to continue.",
    );
    if (entry)
      requireCondition(
        entry.candidateId === "ada",
        "This entry belongs to another candidate.",
      );
  }
  switch (action.type) {
    case "role":
      state.role = action.role;
      break;
    case "advance": {
      requireCondition(
        !state.registrations.some(
          (item) => item.attempt && !item.attempt.submitted,
        ),
        "Finish the active theory attempt before changing the demo date.",
      );
      requireCondition(
        Number.isInteger(action.days) && action.days > 0,
        "Choose a positive number of days.",
      );
      state.now += action.days * DAY;
      for (const item of state.registrations)
        if (
          item.kind === "practical" &&
          !item.file &&
          state.now >= Date.parse(config.sitting.closesAt)
        )
          item.status = "absent";
      break;
    }
    case "profile": {
      z.object({
        name: z.string().trim().min(2),
        email: z.email(),
        phone: z.string().min(8),
        birthDate: z.iso.date(),
      }).parse(action.profile);
      state.profile = {
        ...action.profile,
        prerequisite: state.profile.prerequisite,
      };
      for (const item of state.registrations.filter(
        (item) => item.candidateId === "ada" && !item.result,
      ))
        item.candidate = action.profile.name;
      break;
    }
    case "register": {
      requireCondition(
        config.levels.includes(action.grade) &&
          config.subjects.includes(action.subject),
        "Choose a valid grade and instrument.",
      );
      requireCondition(
        action.kinds.length > 0 &&
          action.kinds.every((kind) => ["theory", "practical"].includes(kind)),
        "Choose an assessment.",
      );
      requireCondition(
        action.grade < config.prerequisiteFrom || state.profile.prerequisite,
        "A verified Grade 5 certificate is required for Grades 6 to 8.",
      );
      requireCondition(
        state.now < Date.parse(config.sitting.closesAt),
        "Registration is closed for this demo sitting.",
      );
      for (const kind of new Set(action.kinds)) {
        requireCondition(
          !state.registrations.some((item) => item.id === `ada-${kind}`),
          `You already have a ${kind} entry for this sitting.`,
        );
        state.registrations.push(
          registration(
            "ada",
            state.profile.name,
            kind,
            action.grade,
            action.subject,
          ),
        );
      }
      state.role = "candidate";
      notify(
        state,
        "Your exam entries are reserved. Complete the mock payment to continue.",
      );
      break;
    }
    case "pay": {
      const unpaid = state.registrations.filter(
        (item) => item.candidateId === "ada" && !item.paid,
      );
      if (!unpaid.length) break;
      state.payments.push({
        ...owned(freshId()),
        amount: unpaid.reduce((sum, item) => sum + config.fees[item.kind], 0),
        reference: `MOCK-${state.payments.length + 1}`,
        createdAt: state.now,
      });
      unpaid.forEach((item) => {
        item.paid = true;
      });
      notify(
        state,
        "Mock payment received. Your December exam entries are confirmed.",
      );
      break;
    }
    case "start-theory": {
      requireCondition(entry?.kind === "theory", "Theory entry not found.");
      requireCondition(entry.paid, "Complete payment before starting.");
      if (entry.attempt) break;
      entry.attempt = {
        order: shuffle(questions.map((question) => question.id)),
        options: Object.fromEntries(
          questions.map((question) => [question.id, shuffle(question.choices)]),
        ),
        answers: {},
        index: 0,
        deadline: action.now + config.theoryMinutes * 60000,
        questionDeadline: action.now + config.questionSeconds * 1000,
        submitted: false,
      };
      entry.status = "in progress";
      break;
    }
    case "answer": {
      requireCondition(
        entry?.attempt && !entry.attempt.submitted,
        "No active attempt.",
      );
      const attempt = entry.attempt;
      requireCondition(
        action.now < attempt.deadline && action.now < attempt.questionDeadline,
        "This question has timed out.",
      );
      requireCondition(
        attempt.options[attempt.order[attempt.index]].includes(action.answer),
        "Choose a listed answer.",
      );
      attempt.answers[attempt.order[attempt.index]] = action.answer;
      break;
    }
    case "next-question": {
      requireCondition(
        entry?.attempt && !entry.attempt.submitted,
        "No active attempt.",
      );
      const attempt = entry.attempt;
      if (
        action.now >= attempt.deadline ||
        attempt.index === attempt.order.length - 1
      )
        finish(entry, state);
      else {
        attempt.index++;
        attempt.questionDeadline = Math.min(
          attempt.deadline,
          action.now + config.questionSeconds * 1000,
        );
      }
      break;
    }
    case "submit-theory":
      requireCondition(entry?.attempt, "No attempt found.");
      finish(entry, state);
      break;
    case "flag": {
      if (entry?.attempt && !entry.attempt.submitted) {
        entry.integrity = "flagged";
        entry.events.push(`${dateTime(Date.now())} - ${action.reason}`);
      }
      break;
    }
    case "submit-video": {
      requireCondition(
        entry?.kind === "practical" && entry.paid,
        "A paid practical entry is required.",
      );
      requireCondition(!entry.file, "A video has already been submitted.");
      requireCondition(
        state.now >= Date.parse(config.sitting.opensAt) &&
          state.now < Date.parse(config.sitting.closesAt),
        "The submission window is closed.",
      );
      requireCondition(
        action.declaration && action.file,
        "A video and signed declaration are required.",
      );
      requireCondition(
        z.iso.date().safeParse(state.profile.birthDate).success && Date.parse(state.profile.birthDate) <= state.now,
        "Complete a valid date of birth in My profile before submitting your performance.",
      );
      const birthday = new Date(state.profile.birthDate);
      const eighteenthBirthday = Date.UTC(birthday.getUTCFullYear() + 18, birthday.getUTCMonth(), birthday.getUTCDate());
      const adult = state.now >= eighteenthBirthday;
      requireCondition(
        adult || state.profile.guardian.trim().length > 2,
        "A parent or guardian must sign for an under-18 candidate.",
      );
      Object.assign(entry, {
        file: action.file,
        fileName: action.fileName || "Sample performance.mp4",
        declared: true,
        status: "submitted",
        submittedAt: state.now,
      });
      notify(
        state,
        `${title(entry)} video received. It is now in the examiner queue.`,
      );
      break;
    }
    case "mark": {
      requireCondition(
        entry?.file && entry.paid,
        "No submitted video to mark.",
      );
      requireCondition(
        ["examiner", "examiner-2"].includes(state.role),
        "Switch to an examiner role.",
      );
      const appeal = state.appeals.find(
        (item) =>
          item.registrationId === entry.id && item.status !== "resolved",
      );
      if (appeal) {
        requireCondition(
          state.role !== entry.scores[0]?.examiner,
          "A different examiner must perform the second marking.",
        );
        requireCondition(
          appeal.status === "awaiting second mark",
          "Second mark already submitted.",
        );
      } else {
        requireCondition(
          state.role === entry.assignedTo,
          "This entry is assigned to another examiner.",
        );
        requireCondition(
          !entry.scores.length,
          "This entry has already been marked.",
        );
      }
      requireCondition(
        action.marks.length === config.rubric.length &&
          action.marks.every(
            (mark, index) =>
              Number.isFinite(mark) &&
              mark >= 0 &&
              mark <= config.rubric[index].max,
          ),
        "Marks must be within the criterion limits.",
      );
      if (action.draft) {
        entry.draft = {
          examiner: state.role,
          marks: action.marks,
          comments: action.comments,
        };
        break;
      }
      requireCondition(
        action.comments.trim().length >= 3,
        "Add examiner comments.",
      );
      entry.scores.push({
        ...owned(freshId()),
        examiner: state.role,
        marks: action.marks,
        total: action.marks.reduce((sum, mark) => sum + mark, 0),
        comments: action.comments,
        submittedAt: state.now,
      });
      delete entry.draft;
      entry.status = "graded";
      entry.clearedAt = state.now;
      if (appeal) appeal.status = "awaiting approval";
      notify(
        state,
        `${title(entry)} ${appeal ? "second marking" : "marking"} completed.`,
      );
      break;
    }
    case "integrity": {
      requireCondition(
        entry?.kind === "theory" && entry.scores.length && !entry.result,
        "No unpublished theory result to review.",
      );
      requireCondition(
        action.note.trim().length >= 3,
        "A review note is required.",
      );
      entry.integrity = action.decision;
      entry.reviewNote = action.note;
      entry.clearedAt = action.decision === "cleared" ? state.now : undefined;
      break;
    }
    case "publish": {
      let count = 0;
      for (const item of state.registrations)
        if (eligible(item) && !item.result) {
          item.result = {
            total: item.scores[0].total,
            version: 1,
            publishedAt: state.now,
          };
          count++;
        }
      notify(
        state,
        `${count} eligible results published for ${config.sitting.name}.`,
      );
      break;
    }
    case "issue": {
      requireCondition(
        entry?.result &&
          entry.result.total >= config.passMark &&
          eligible(entry),
        "A published passing result is required.",
      );
      if (
        state.certificates.some(
          (item) => item.registrationId === entry.id && item.status === "valid",
        )
      )
        break;
      requireCondition(
        state.now >=
          (entry.clearedAt ?? entry.result.publishedAt) +
            config.certificateDelayDays * DAY,
        "Certificate pending: allow 3 to 7 days after review.",
      );
      requireCondition(
        !state.appeals.some(
          (item) =>
            item.registrationId === entry.id && item.status !== "resolved",
        ),
        "Resolve the active appeal before issuing a certificate.",
      );
      state.certificates.push({
        ...owned(freshId()),
        registrationId: entry.id,
        number: `MUSON-2026-${String(state.certificates.length + 1001)}`,
        candidate: entry.candidate,
        exam: title(entry),
        grade: entry.grade,
        mark: entry.result.total,
        issuedAt: state.now,
        status: "valid",
      });
      notify(state, `${title(entry)} certificate is ready to download.`);
      break;
    }
    case "cancel-certificate": {
      const certificate = state.certificates.find(
        (item) => item.id === action.id,
      );
      requireCondition(certificate, "Certificate not found.");
      certificate.status = "cancelled";
      break;
    }
    case "appeal": {
      requireCondition(
        entry?.result && entry.kind === "practical",
        "A published practical result is required.",
      );
      requireCondition(
        state.now <= entry.result.publishedAt + config.appealDays * DAY,
        "The appeal window has closed.",
      );
      requireCondition(
        !state.appeals.some((item) => item.registrationId === entry.id),
        "An appeal has already been submitted.",
      );
      requireCondition(
        action.reason.trim().length >= 10,
        "Explain your appeal in at least 10 characters.",
      );
      state.appeals.push({
        ...owned(freshId()),
        registrationId: entry.id,
        reason: action.reason,
        status: "awaiting second mark",
        createdAt: state.now,
      });
      notify(
        state,
        "Your appeal has been received and assigned for independent second marking.",
      );
      break;
    }
    case "resolve-appeal": {
      const appeal = state.appeals.find(
        (item) => item.registrationId === action.id,
      );
      requireCondition(
        entry?.result &&
          appeal?.status === "awaiting approval" &&
          entry.scores.length === 2,
        "A second mark is required.",
      );
      const next = entry.scores[1].total;
      appeal.status = "resolved";
      appeal.outcome = `Review complete: ${entry.result.total}% to ${next}%. ${entry.scores[1].comments}`;
      if (next !== entry.result.total) {
        state.certificates
          .filter(
            (item) =>
              item.registrationId === entry.id && item.status === "valid",
          )
          .forEach((item) => {
            item.status = "superseded";
          });
        entry.result = {
          total: next,
          publishedAt: state.now,
          version: entry.result.version + 1,
        };
        entry.clearedAt = state.now;
      }
      notify(state, appeal.outcome);
      break;
    }
    case "save-application": {
      const index = state.applications.findIndex(
        (item) =>
          item.id === action.application.id && item.candidateId === "ada",
      );
      requireCondition(
        index >= 0 &&
          ["draft", "needs info"].includes(state.applications[index].status),
        "This application cannot be edited now.",
      );
      const current = state.applications[index];
      const subjectGrades = action.application.subjectGrades;
      if (subjectGrades) z.array(z.object({ subject: z.string().trim().min(2), grade: z.enum(["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]), sitting: z.number().int().min(1).max(2) })).min(1).max(9).refine(rows => new Set(rows.map(row => row.subject.trim().toLowerCase())).size === rows.length, "List each subject only once.").parse(subjectGrades);
      const credits = subjectGrades?.filter(row => ["A1", "B2", "B3", "C4", "C5", "C6"].includes(row.grade));
      state.applications[index] = {
        ...action.application,
        ...(credits ? { credits: credits.length, english: credits.some(row => row.subject.trim().toLowerCase() === "english language"), sittings: new Set(subjectGrades!.map(row => row.sitting)).size } : {}),
        ...owned(current.id),
        candidateId: current.candidateId,
        status: current.status,
        paid: current.paid,
        note: current.note,
        slotId: current.slotId,
        documents: current.documents.map((document) => {
          const updated = action.application.documents.find(
            (item) => item.id === document.id,
          );
          return updated?.file && updated.file !== document.file
            ? {
                ...document,
                file: updated.file,
                name: updated.name,
                status: "pending" as const,
              }
            : document;
        }),
      };
      break;
    }
    case "submit-application": {
      requireCondition(
        application && ["draft", "needs info"].includes(application.status),
        "Application is not editable.",
      );
      requireCondition(
        application.sittings >= 1 &&
          application.sittings <= 2 &&
          Number.isInteger(application.sittings) &&
          application.credits >= 5 &&
          application.english,
        "Five credits including English, in at most two sittings, are required.",
      );
      requireCondition(
        application.theoryLevel >= 5 &&
          application.practicalLevel >= 5 &&
          config.acceptedBodies.includes(application.body),
        "Grade 5 or above in theory and practical is required.",
      );
      requireCondition(
        application.documents.every(
          (item) => item.file && item.status !== "rejected",
        ),
        "Upload all required documents, including any replacements.",
      );
      requireCondition(
        config.subjects.includes(application.instrument) &&
          application.name.trim().length > 2,
        "Complete the name and instrument fields.",
      );
      if (!application.paid)
        state.payments.push({
          ...owned(freshId()),
          amount: config.fees.application,
          reference: `MOCK-APP-${state.payments.length + 1}`,
          createdAt: state.now,
        });
      application.paid = true;
      application.status = "submitted";
      notify(
        state,
        "Diploma application submitted. Mock application fee received.",
      );
      break;
    }
    case "document": {
      const document = application?.documents.find(
        (item) => item.id === action.documentId,
      );
      requireCondition(
        document?.file &&
          application &&
          ["submitted", "under review", "needs info"].includes(
            application.status,
          ),
        "No document to verify.",
      );
      requireCondition(
        action.status !== "rejected" || action.note.trim().length > 2,
        "Add a note explaining the replacement needed.",
      );
      document.status = action.status;
      document.note = action.note;
      application.status = application.documents.some(item => item.status === "rejected") ? "needs info" : "under review";
      if (action.status === "rejected") {
        application.note = `Replace ${document.label}: ${action.note}`;
        notify(state, `${application.name}: replacement requested for ${document.label}.`);
      }
      if (application.candidateId === "ada") state.profile.prerequisite = application.documents.slice(1, 3).every(item => item.status === "verified");
      break;
    }
    case "review-application": {
      requireCondition(
        application &&
          ["submitted", "under review", "needs info"].includes(
            application.status,
          ),
        "Application is not in review.",
      );
      requireCondition(
        ["under review", "needs info", "shortlisted", "rejected"].includes(
          action.status,
        ),
        "Invalid review transition.",
      );
      if (action.status === "shortlisted")
        requireCondition(
          application.documents.every((item) => item.status === "verified"),
          "Verify all documents before shortlisting.",
        );
      if (["needs info", "rejected"].includes(action.status))
        requireCondition(
          action.note.trim().length > 2,
          "Add a message for the candidate.",
        );
      application.status = action.status;
      application.note = action.note;
      notify(state, `Diploma application: ${action.status}. ${action.note}`);
      break;
    }
    case "create-slot": {
      requireCondition(
        Number.isInteger(action.slot.capacity) &&
          action.slot.capacity > 0 &&
          action.slot.venue.trim().length > 2 &&
          Number.isFinite(Date.parse(action.slot.date)) &&
          Date.parse(action.slot.date) > state.now,
        "Choose a future date, venue and positive capacity.",
      );
      state.slots.push({
        ...action.slot,
        ...owned(freshId()),
        applicationIds: [],
      });
      break;
    }
    case "schedule": {
      const slot = state.slots.find((item) => item.id === action.slotId);
      const ids = [...new Set(action.applicationIds)];
      requireCondition(
        slot &&
          ids.length > 0 &&
          slot.applicationIds.length + ids.length <= slot.capacity,
        "Not enough capacity in this slot.",
      );
      for (const id of ids) {
        const item = state.applications.find((value) => value.id === id);
        requireCondition(
          item?.status === "shortlisted" && !item.slotId,
          "Only unscheduled shortlisted candidates can be assigned.",
        );
        item.status = "audition scheduled";
        item.slotId = slot.id;
        slot.applicationIds.push(id);
      }
      notify(
        state,
        `Entrance exam scheduled for ${date(slot.date)} at ${slot.venue} (${slot.mode}).`,
      );
      break;
    }
  }
  return state;
}

export function checkpoint(
  name: "start" | "registered" | "marking" | "results" | "diploma" | "appeal",
): State {
  let state = createSeed();
  state.role = "candidate";
  if (name === "start") return state;
  if (name === "diploma") {
    const application = structuredClone(state.applications[0]);
    application.documents.forEach(document => { document.file = "sample"; document.name = `Sample ${document.label}.pdf`; });
    state = transition(state, { type: "save-application", application });
    state = transition(state, { type: "submit-application", id: application.id });
    state.role = "admin";
    return state;
  }
  state = transition(state, {
    type: "register",
    grade: 5,
    subject: "Piano",
    kinds: ["theory", "practical"],
  });
  state = transition(state, { type: "pay" });
  if (name === "registered") return state;
  state = transition(state, {
    type: "start-theory",
    id: "ada-theory",
    now: Date.now(),
  });
  const attempt = state.registrations.find(
    (item) => item.id === "ada-theory",
  )!.attempt!;
  attempt.answers = Object.fromEntries(
    questions.map((question) => [question.id, question.correct]),
  );
  state = transition(state, {
    type: "submit-theory",
    id: "ada-theory",
    now: Date.now(),
  });
  state = transition(state, {
    type: "submit-video",
    id: "ada-practical",
    file: "sample",
    declaration: true,
  });
  if (name === "marking") {
    state.role = "examiner";
    return state;
  }
  state.role = "examiner";
  state = transition(state, {
    type: "mark",
    id: "ada-practical",
    marks: [23, 22, 23, 8],
    comments:
      "A confident performance. Develop a wider dynamic range in the second piece.",
    draft: false,
  });
  state.role = "admin";
  for (const item of state.registrations.filter(
    (value) => value.kind === "theory",
  ))
    state = transition(state, {
      type: "integrity",
      id: item.id,
      decision: "cleared",
      note: "Reviewed demo evidence. No further action.",
    });
  state = transition(state, { type: "publish" });
  state = transition(state, { type: "advance", days: 4 });
  state = transition(state, { type: "issue", id: "ada-theory" });
  state = transition(state, { type: "issue", id: "ada-practical" });
  state.role = "candidate";
  if (name === "appeal") {
    state = transition(state, { type: "appeal", id: "ada-practical", reason: "Please review the interpretation mark for my second piece." });
    state.role = "examiner-2";
  }
  return state;
}
