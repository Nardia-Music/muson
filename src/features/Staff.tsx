"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import {
  config,
  date,
  eligible,
  title,
  type Registration,
} from "@/lib/workflows";
import { useFileUrl } from "@/lib/files";
import {
  Badge,
  Empty,
  Field,
  Go,
  Heading,
  Notice,
  Stat,
} from "@/components/ui";

export function AdminOverview() {
  const { data } = useDemo();
  return (
    <>
      <Heading
        eyebrow="MUSON ADMINISTRATION"
        title="A clear view of what comes next."
        action={
          <Link className="button" href="/admin/results">
            Review results
            <ArrowRight size={16} />
          </Link>
        }
      >
        December 2026 sitting · {date(data.now)}
      </Heading>
      <div className="stats">
        <Stat
          label="PAID EXAM ENTRIES"
          value={data.registrations.filter((item) => item.paid).length}
        />
        <Stat
          label="APPLICATIONS TO REVIEW"
          value={
            data.applications.filter((item) =>
              ["submitted", "under review"].includes(item.status),
            ).length
          }
        />
        <Stat
          label="INTEGRITY REVIEWS"
          value={
            data.registrations.filter(
              (item) =>
                item.kind === "theory" &&
                item.scores.length &&
                !item.result &&
                item.integrity !== "cleared",
            ).length
          }
        />
        <Stat
          label="READY TO PUBLISH"
          value={
            data.registrations.filter((item) => eligible(item) && !item.result)
              .length
          }
        />
      </div>
      <div className="equal-columns">
        {[
          [
            ShieldCheck,
            "Integrity review",
            "Review flagged sessions and release cleared papers.",
            "/admin/integrity",
          ],
          [
            FileCheck2,
            "Application review",
            "Check documents, shortlist and schedule auditions.",
            "/admin/applications",
          ],
          [
            Award,
            "Results & certificates",
            "Publish eligible results and issue certificates.",
            "/admin/results",
          ],
        ].map(([Icon, name, description, href]) => {
          const Symbol = Icon as typeof Award;
          return (
            <article className="exam-card" key={String(name)}>
              <span className="subject-icon">
                <Symbol size={23} />
              </span>
              <h3>{String(name)}</h3>
              <p>{String(description)}</p>
              <div className="card-bottom">
                <Go href={String(href)}>Open workspace</Go>
              </div>
            </article>
          );
        })}
      </div>
      <div className="section-title space-top">
        <h2>Recent activity</h2>
      </div>
      <ul className="activity">
        {data.notifications.slice(0, 6).map((item) => (
          <li key={item.id}>
            <p>{item.text}</p>
            <small>{date(item.createdAt)}</small>
          </li>
        ))}
      </ul>
    </>
  );
}

export function GradingQueue() {
  const { data } = useDemo();
  const entries = data.registrations.filter(
    (item) =>
      item.kind === "practical" &&
      item.file &&
      (item.assignedTo === data.role ||
        data.appeals.some(
          (appeal) =>
            appeal.registrationId === item.id &&
            appeal.status !== "resolved" &&
            item.scores[0]?.examiner !== data.role,
        )),
  );
  return (
    <>
      <Heading eyebrow="EXAMINER WORKSPACE" title="Grading queue">
        {data.role === "examiner-2"
          ? "Ms Sarah Williams · Independent second marking"
          : "Dr Tunde Adebayo · Practical examinations"}
      </Heading>
      <div className="stats">
        <Stat label="ASSIGNED VIDEOS" value={entries.length} />
        <Stat
          label="AWAITING FIRST MARK"
          value={entries.filter((item) => !item.scores.length).length}
        />
        <Stat
          label="APPEALS"
          value={
            data.appeals.filter(
              (item) => item.status === "awaiting second mark",
            ).length
          }
        />
        <Stat
          label="MARKED"
          value={entries.filter((item) => item.scores.length).length}
        />
      </div>
      {entries.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>EXAMINATION</th>
                <th>RECEIVED</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.candidate}</strong>
                    <small>{entry.id}</small>
                  </td>
                  <td>{title(entry)}</td>
                  <td>{date(entry.submittedAt!)}</td>
                  <td>
                    <Badge>
                      {data.appeals.find(
                        (item) => item.registrationId === entry.id,
                      )?.status ||
                        (entry.scores.length ? "graded" : "awaiting marking")}
                    </Badge>
                  </td>
                  <td>
                    <Go href={`/examiner/marking?id=${entry.id}`}>
                      Open marking
                    </Go>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="Your queue is clear">
          Submitted performances assigned to you will appear here.
        </Empty>
      )}
    </>
  );
}

export function Marking() {
  const { data } = useDemo();
  const id = useSearchParams().get("id");
  const entry =
    data.registrations.find((item) => item.id === id) ||
    (!id
      ? data.registrations.find((item) => item.file && !item.scores.length)
      : undefined);
  return entry?.file ? (
    <MarkingForm key={`${entry.id}-${data.role}`} entry={entry} />
  ) : (
    <Empty title="Select a performance" href="/examiner" label="Grading queue">
      Open a submitted video from your queue.
    </Empty>
  );
}

function MarkingForm({ entry }: { entry: Registration }) {
  const { data, run } = useDemo();
  const appeal = data.appeals.find(
    (item) => item.registrationId === entry.id && item.status !== "resolved",
  );
  const completed = appeal
    ? appeal.status === "awaiting approval"
    : entry.scores.length > 0;
  const [marks, setMarks] = useState(
    entry.draft?.examiner === data.role
      ? entry.draft.marks
      : config.rubric.map(() => 0),
  );
  const [comments, setComments] = useState(
    entry.draft?.examiner === data.role ? entry.draft.comments : "",
  );
  const [saved, setSaved] = useState(false);
  const url = useFileUrl(entry.file, true);
  return (
    <>
      <Heading
        eyebrow={appeal ? "INDEPENDENT REVIEW" : "PRACTICAL ASSESSMENT"}
        title={entry.candidate}
        action={<Badge>{appeal?.status || entry.status}</Badge>}
      >
        {title(entry)} · {config.sitting.name}
      </Heading>
      <div className="two-column">
        <section>
          <video
            className="media-player"
            controls
            src={url}
            preload="metadata"
          />
          <div className="panel space-top">
            <h3>Submission details</h3>
            <p>{entry.fileName}</p>
            <p>
              Received {date(entry.submittedAt!)} · Code {entry.code}
            </p>
            <Notice tone="success">Candidate declaration recorded.</Notice>
            {entry.file === "sample" && (
              <small>
                Bundled illustrative clip, not a real candidate performance.
              </small>
            )}
            {appeal && <Notice>Appeal reason: {appeal.reason}</Notice>}
          </div>
        </section>
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            run({ type: "mark", id: entry.id, marks, comments, draft: false });
          }}
        >
          <h2>{completed ? "Marking submitted" : "Marking sheet"}</h2>
          {completed ? (
            <>
              <div className="score-number">
                {entry.scores.at(-1)?.total}
                <small> / 100</small>
              </div>
              <p>{entry.scores.at(-1)?.comments}</p>
              <Notice tone="success">Saved for administrator review.</Notice>
              <Go href="/examiner">Back to queue</Go>
            </>
          ) : (
            <>
              {config.rubric.map((criterion, index) => (
                <label className="rubric-row" key={criterion.name}>
                  <span>{criterion.name}</span>
                  <input
                    aria-label={criterion.name}
                    type="number"
                    required
                    min={0}
                    max={criterion.max}
                    value={marks[index]}
                    onChange={(event) =>
                      setMarks(
                        marks.map((value, position) =>
                          position === index
                            ? Number(event.target.value)
                            : value,
                        ),
                      )
                    }
                  />
                  <small>/ {criterion.max}</small>
                </label>
              ))}
              <div className="total-row">
                <span>Total mark</span>
                <strong>
                  {marks.reduce((sum, value) => sum + value, 0)} / 100
                </strong>
              </div>
              <Field label="Examiner comments">
                <textarea
                  required
                  minLength={3}
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  placeholder="Record strengths and areas for development."
                />
              </Field>
              <div className="form-actions">
                <button className="button" type="submit">
                  Submit mark
                  <CheckCircle2 size={16} />
                </button>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() =>
                    setSaved(
                      run({
                        type: "mark",
                        id: entry.id,
                        marks,
                        comments,
                        draft: true,
                      }),
                    )
                  }
                >
                  Save draft
                </button>
              </div>
              {saved && <Notice tone="success">Draft saved.</Notice>}
            </>
          )}
        </form>
      </div>
    </>
  );
}

export function Integrity() {
  const { data } = useDemo();
  const entries = data.registrations.filter(
    (item) => item.kind === "theory" && item.scores.length,
  );
  return (
    <>
      <Heading eyebrow="EXAM INTEGRITY" title="Review with confidence.">
        Review the available evidence before releasing a theory result.
      </Heading>
      <div className="stack">
        {entries.map((entry) => (
          <IntegrityItem key={entry.id} entry={entry} />
        ))}
      </div>
    </>
  );
}
function IntegrityItem({ entry }: { entry: Registration }) {
  const { run } = useDemo();
  const [note, setNote] = useState(entry.reviewNote || "");
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <h3>{entry.candidate}</h3>
          <p>
            {title(entry)} · Provisional score {entry.scores[0].total}%
          </p>
        </div>
        <Badge>{entry.integrity}</Badge>
      </div>
      <ul className="guidelines">
        {(entry.events.length
          ? entry.events
          : [
              "No browser warnings recorded.",
              "Simulated identity and readiness check.",
            ]
        ).map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
      {entry.result ? (
        <Notice tone="success">
          Review completed and result published. {entry.reviewNote}
        </Notice>
      ) : (
        <>
          <Field label={`Review note for ${entry.candidate}`}>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="form-actions">
            <button
              className="button"
              onClick={() =>
                run({
                  type: "integrity",
                  id: entry.id,
                  decision: "cleared",
                  note,
                })
              }
            >
              <ShieldCheck size={16} />
              Clear session
            </button>
            <button
              className="button secondary"
              onClick={() =>
                run({
                  type: "integrity",
                  id: entry.id,
                  decision: "referred",
                  note,
                })
              }
            >
              Refer for investigation
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export function PublishResults() {
  const { data, run } = useDemo();
  const ready = data.registrations.filter(
    (item) => eligible(item) && !item.result,
  );
  return (
    <>
      <Heading
        eyebrow="DECEMBER 2026"
        title="Review & publish results"
        action={
          <button
            className="button"
            disabled={!ready.length}
            onClick={() => {
              if (
                confirm(
                  `Publish ${ready.length} eligible results? Held entries will remain unpublished.`,
                )
              )
                run({ type: "publish" });
            }}
          >
            Publish {ready.length} results
            <ArrowRight size={16} />
          </button>
        }
      >
        Only paid, marked and cleared entries can be released.
      </Heading>
      <Notice>
        Unpaid, unmarked or unresolved theory sessions are held. Publishing
        releases eligible results only.
      </Notice>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CANDIDATE</th>
              <th>EXAMINATION</th>
              <th>SCORE</th>
              <th>READINESS</th>
            </tr>
          </thead>
          <tbody>
            {data.registrations.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <strong>{entry.candidate}</strong>
                </td>
                <td>{title(entry)}</td>
                <td>{entry.result?.total ?? entry.scores[0]?.total ?? "—"}</td>
                <td>
                  <Badge>
                    {entry.result
                      ? "published"
                      : eligible(entry)
                        ? "ready"
                        : !entry.paid
                          ? "payment due"
                          : !entry.scores.length
                            ? "awaiting assessment"
                            : `integrity: ${entry.integrity}`}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions">
        <Go href="/admin/certificates">Manage certificates</Go>
      </div>
    </>
  );
}

export function IssueCertificates() {
  const { data, run } = useDemo();
  const entries = data.registrations.filter(
    (item) => item.result && item.result.total >= config.passMark,
  );
  return (
    <>
      <Heading eyebrow="QUALIFICATIONS" title="Certificate issuing">
        Issue sample certificates after the review period. Cancellation updates
        this browser only.
      </Heading>
      <Notice>
        Certificates become eligible {config.certificateDelayDays} days after
        clearance. Use the presenter date control to demonstrate the waiting
        period.
      </Notice>
      {entries.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>EXAMINATION</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const certificate = data.certificates.find(
                  (item) =>
                    item.registrationId === entry.id && item.status === "valid",
                );
                return (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.candidate}</strong>
                    </td>
                    <td>{title(entry)}</td>
                    <td>
                      <Badge>
                        {certificate ? "valid" : "pending issuance"}
                      </Badge>
                      {certificate && <small>{certificate.number}</small>}
                    </td>
                    <td>
                      {certificate ? (
                        <button
                          className="button secondary small"
                          onClick={() => {
                            if (confirm("Cancel this sample certificate?"))
                              run({
                                type: "cancel-certificate",
                                id: certificate.id,
                              });
                          }}
                        >
                          Cancel certificate
                        </button>
                      ) : (
                        <button
                          className="button small"
                          onClick={() => run({ type: "issue", id: entry.id })}
                        >
                          Issue certificate
                          <Award size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No eligible results yet">
          Publish passing results before issuing certificates.
        </Empty>
      )}
    </>
  );
}

export function AdminAppeals() {
  const { data, run } = useDemo();
  return (
    <>
      <Heading eyebrow="INDEPENDENT REVIEW" title="Appeals queue">
        A second examiner reviews each appealed performance.
      </Heading>
      {data.appeals.length ? (
        <div className="stack">
          {data.appeals.map((appeal) => {
            const entry = data.registrations.find(
              (item) => item.id === appeal.registrationId,
            )!;
            return (
              <section className="panel" key={appeal.id}>
                <div className="section-title">
                  <div>
                    <h3>{entry.candidate}</h3>
                    <p>{title(entry)}</p>
                  </div>
                  <Badge>{appeal.status}</Badge>
                </div>
                <p>{appeal.reason}</p>
                <div className="equal-columns">
                  {entry.scores.map((score, index) => (
                    <div key={score.id}>
                      <small>
                        {index ? "Second examiner" : "Original examiner"} ·{" "}
                        {score.examiner}
                      </small>
                      <h2 className="space-top">{score.total}%</h2>
                      <p>{score.comments}</p>
                    </div>
                  ))}
                </div>
                {appeal.status === "awaiting second mark" && (
                  <Notice>
                    Switch to Examiner · Ms Williams to complete independent
                    second marking.
                  </Notice>
                )}
                {appeal.status === "awaiting approval" && (
                  <button
                    className="button"
                    onClick={() =>
                      run({ type: "resolve-appeal", id: entry.id })
                    }
                  >
                    Approve review outcome
                    <CheckCircle2 size={16} />
                  </button>
                )}
                {appeal.outcome && (
                  <Notice tone="success">{appeal.outcome}</Notice>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <Empty title="No appeals awaiting review">
          Candidate appeals will appear here after results are published.
        </Empty>
      )}
    </>
  );
}
