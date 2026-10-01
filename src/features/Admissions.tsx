"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
import { useDemo } from "@/lib/store";
import {
  config,
  date,
  money,
  type Application,
  type DocumentRecord,
} from "@/lib/workflows";
import { saveFile, useFileUrl } from "@/lib/files";
import {
  Badge,
  Empty,
  Field,
  Go,
  Heading,
  Notice,
  Steps,
  MockCheckout,
} from "@/components/ui";

export function DiplomaApplication() {
  const { data, run } = useDemo();
  const stored = data.applications[0];
  const [form, setForm] = useState(stored);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const editable = ["draft", "needs info"].includes(stored.status);
  const slot = data.slots.find((item) => item.id === stored.slotId);
  const update = (patch: Partial<Application>) =>
    setForm({ ...form, ...patch });
  const updateSubjects = (subjectGrades: NonNullable<Application["subjectGrades"]>) => {
    const credits = subjectGrades.filter(row => ["A1", "B2", "B3", "C4", "C5", "C6"].includes(row.grade));
    update({ subjectGrades, credits: credits.length, english: credits.some(row => row.subject.trim().toLowerCase() === "english language"), sittings: new Set(subjectGrades.map(row => row.sitting)).size });
  };
  const save = () => {
    const saved = run({ type: "save-application", application: form });
    if (saved) setMessage("Draft saved.");
    return saved;
  };
  const upload = async (document: DocumentRecord, file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const key = await saveFile(file);
      update({
        documents: form.documents.map((item) =>
          item.id === document.id
            ? { ...item, file: key, name: file.name, status: "pending" }
            : item,
        ),
      });
      setMessage("");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Heading
        eyebrow="MUSON / MTN FOUNDATION · 2027 INTAKE"
        title="Diploma application"
        action={<Badge>{stored.status}</Badge>}
      >
        A two-year journey in performance, musicianship and professional
        practice.
      </Heading>
      <Steps
        labels={[
          "Personal details",
          "Qualifications",
          "Documents",
          "Review & submit",
        ]}
        current={editable ? step : 4}
      />
      <MockCheckout key={String(checkout)} open={checkout} amount={config.fees.application} onClose={() => setCheckout(false)} onComplete={() => { run({ type: "submit-application", id: stored.id }); setCheckout(false); }} />
      {stored.note && (
        <Notice tone={stored.status === "needs info" ? "warning" : "info"}>
          {stored.note}
        </Notice>
      )}
      {stored.status === "needs info" && step !== 2 && <button className="button secondary" onClick={() => setStep(2)}>Replace requested documents<ArrowRight size={16} /></button>}
      {!editable ? (
        <div className="panel">
          <CheckCircle2 size={34} color="var(--green)" />
          <h2 className="space-top">
            {stored.status === "audition scheduled"
              ? "Your entrance examination is scheduled."
              : "Your application is with MUSON."}
          </h2>
          <p>
            {stored.name} · {stored.instrument} · Reference MUSON-DIP-2027-001
          </p>
          {slot ? (
            <>
              <Notice tone="success">
                {date(slot.date)} at{" "}
                {new Date(slot.date).toLocaleTimeString("en-GB", {
                  timeZone: "Africa/Lagos",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WAT · {slot.venue} · {slot.mode}
              </Notice>
              <ul className="guidelines">
                <li>Written theory and general knowledge paper</li>
                <li>Practical audition ({slot.mode.toLowerCase()})</li>
                <li>Aural interview</li>
              </ul>
            </>
          ) : (
            <Notice>
              Your status and any requests for documents will appear here.
            </Notice>
          )}
          <div className="stack">
            {stored.documents.map((document) => (
              <DocumentView key={document.id} document={document} />
            ))}
          </div>
        </div>
      ) : (
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            if (save()) {
              if (stored.paid) run({ type: "submit-application", id: stored.id });
              else setCheckout(true);
            }
          }}
        >
          {step === 0 && (
            <>
              <h2>Personal details</h2>
              <div className="form-grid">
                <Field label="Full name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) => update({ name: event.target.value })}
                  />
                </Field>
                <Field label="Main instrument or voice">
                  <select
                    value={form.instrument}
                    onChange={(event) =>
                      update({ instrument: event.target.value })
                    }
                  >
                    {config.subjects.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Notice>
                Your email and guardian details are held in your candidate
                profile.
              </Notice>
              <Go href="/candidate/profile">Edit profile</Go>
            </>
          )}
          {step === 1 && (
            <>
              <h2>Entry qualifications</h2>
              <h3>O&apos;Level subject grades</h3>
              <div className="table-wrap space-top"><table>
                <thead><tr><th>SUBJECT</th><th>GRADE</th><th>SITTING</th><th /></tr></thead>
                <tbody>{(form.subjectGrades || []).map((row, index) => <tr key={index}>
                  <td><input aria-label={`Subject ${index + 1}`} value={row.subject} onChange={event => updateSubjects(form.subjectGrades!.map((item, position) => position === index ? { ...item, subject: event.target.value } : item))} /></td>
                  <td><select aria-label={`Grade for subject ${index + 1}`} value={row.grade} onChange={event => updateSubjects(form.subjectGrades!.map((item, position) => position === index ? { ...item, grade: event.target.value } : item))}>{["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"].map(grade => <option key={grade}>{grade}</option>)}</select></td>
                  <td><select aria-label={`Sitting for subject ${index + 1}`} value={row.sitting} onChange={event => updateSubjects(form.subjectGrades!.map((item, position) => position === index ? { ...item, sitting: Number(event.target.value) } : item))}><option value={1}>1</option><option value={2}>2</option></select></td>
                  <td><button className="icon-button" type="button" aria-label={`Remove subject ${index + 1}`} title="Remove subject" onClick={() => updateSubjects(form.subjectGrades!.filter((_, position) => position !== index))}><Trash2 size={16} /></button></td>
                </tr>)}</tbody>
              </table></div>
              <button className="button secondary small" type="button" disabled={(form.subjectGrades?.length || 0) >= 9} onClick={() => updateSubjects([...(form.subjectGrades || []), { subject: "", grade: "C6", sitting: 1 }])}><Plus size={16} />Add subject</button>
              <p className="space-top">{form.credits} credits in {form.sittings} sitting(s). English Language: {form.english ? "credit achieved" : "credit required"}.</p>
              <div className="form-grid">
                <Field label="O'Level / SSCE sittings">
                  <input
                    type="number"
                    min={1}
                    max={2}
                    readOnly={Boolean(form.subjectGrades)}
                    value={form.sittings}
                    onChange={(event) =>
                      update({ sittings: Number(event.target.value) })
                    }
                  />
                </Field>
                <Field label="Credits achieved">
                  <input
                    type="number"
                    min={5}
                    max={9}
                    readOnly={Boolean(form.subjectGrades)}
                    value={form.credits}
                    onChange={(event) =>
                      update({ credits: Number(event.target.value) })
                    }
                  />
                </Field>
                <Field label="Theory certificate grade">
                  <input
                    type="number"
                    min={5}
                    max={8}
                    value={form.theoryLevel}
                    onChange={(event) =>
                      update({ theoryLevel: Number(event.target.value) })
                    }
                  />
                </Field>
                <Field label="Practical certificate grade">
                  <input
                    type="number"
                    min={5}
                    max={8}
                    value={form.practicalLevel}
                    onChange={(event) =>
                      update({ practicalLevel: Number(event.target.value) })
                    }
                  />
                </Field>
                <Field label="Certificate awarding body">
                  <select
                    value={form.body}
                    onChange={(event) => update({ body: event.target.value })}
                  >
                    {config.acceptedBodies.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.english}
                  disabled={Boolean(form.subjectGrades)}
                  onChange={(event) =>
                    update({ english: event.target.checked })
                  }
                />
                My five credits include English Language.
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Supporting documents</h2>
              <Notice>
                Use sample files or fictional documents only. Files stay in this
                browser.
              </Notice>
              {form.documents.map((document) => (
                <div className="document-row" key={document.id}>
                  <DocumentView document={document} />
                  <Field label={`Upload ${document.label}`}>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      disabled={busy}
                      onChange={(event) =>
                        upload(document, event.target.files?.[0])
                      }
                    />
                  </Field>
                  <button
                    className="button secondary small"
                    type="button"
                    onClick={() =>
                      update({
                        documents: form.documents.map((item) =>
                          item.id === document.id
                            ? {
                                ...item,
                                file: `sample-${crypto.randomUUID()}`,
                                name: `Sample ${item.label}.pdf`,
                                status: "pending",
                              }
                            : item,
                        ),
                      })
                    }
                  >
                    <FileText size={14} />
                    Use sample document
                  </button>
                </div>
              ))}
            </>
          )}
          {step === 3 && (
            <>
              <h2>Review your application</h2>
              <div className="total-row">
                <span>{form.name}</span>
                <strong>{form.instrument}</strong>
              </div>
              <p>
                {form.credits} credits · {form.sittings} sitting(s) ·{" "}
                {form.body} Grade {form.theoryLevel} theory / Grade{" "}
                {form.practicalLevel} practical
              </p>
              <p>
                {form.documents.filter((document) => document.file).length} of 4
                documents attached.
              </p>
              <div className="total-row">
                <span>Application fee</span>
                <strong>
                  {stored.paid ? "Paid" : money(config.fees.application)}
                </strong>
              </div>
              <Notice>
                Submission includes a mock payment. No money is charged and no
                real application is sent to MUSON.
              </Notice>
              <button className="button" type="submit" disabled={busy}>
                Pay mock fee & submit
                <ArrowRight size={16} />
              </button>
            </>
          )}
          <div className="form-actions">
            {step > 0 && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  save();
                  setStep(step - 1);
                }}
              >
                Back
              </button>
            )}
            <button type="button" className="button secondary" onClick={save}>
              Save draft
            </button>
            {step < 3 && (
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (save()) setStep(step + 1);
                }}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            )}
          </div>
          {message && <Notice>{message}</Notice>}
        </form>
      )}
    </>
  );
}

function DocumentView({ document }: { document: DocumentRecord }) {
  const url = useFileUrl(document.file);
  return (
    <div>
      <div className="section-title">
        <strong>{document.label}</strong>
        <Badge>{document.status === "rejected" ? "replacement required" : document.status}</Badge>
      </div>
      {document.name && <small>{document.name}</small>}
      {document.note && <Notice tone="warning">{document.note}</Notice>}
      {url && (
        <a className="text-link" href={url} target="_blank" rel="noreferrer">
          View document
          <FileText size={15} />
        </a>
      )}
    </div>
  );
}

export function ApplicationQueue() {
  const { data } = useDemo();
  const [status, setStatus] = useState("all");
  const [instrument, setInstrument] = useState("all");
  const applications = data.applications.filter(
    (item) =>
      item.status !== "draft" &&
      (status === "all" || item.status === status) &&
      (instrument === "all" || item.instrument === instrument),
  );
  return (
    <>
      <Heading eyebrow="ADMISSIONS OFFICE" title="Application review">
        2027 Diploma intake · MUSON / MTN Foundation
      </Heading>
      <div className="form-grid">
        <Field label="Application status">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {[
              "submitted",
              "under review",
              "needs info",
              "shortlisted",
              "audition scheduled",
              "rejected",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Instrument">
          <select
            value={instrument}
            onChange={(event) => setInstrument(event.target.value)}
          >
            <option value="all">All instruments</option>
            {config.subjects.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      {applications.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>APPLICANT</th>
                <th>PROGRAMME</th>
                <th>INSTRUMENT</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {applications.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small>MUSON-DIP-2027-{String(data.applications.indexOf(item) + 1).padStart(3, "0")}</small>
                  </td>
                  <td>Diploma</td>
                  <td>{item.instrument}</td>
                  <td>
                    <Badge>{item.status}</Badge>
                  </td>
                  <td>
                    <Go href={`/admin/application?id=${item.id}`}>Review</Go>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No matching applications">
          Submitted applications will appear here. Drafts remain with the
          candidate.
        </Empty>
      )}
    </>
  );
}

export function ApplicationReview() {
  const { data, run } = useDemo();
  const id = useSearchParams().get("id") || "ada-diploma";
  const application = data.applications.find((item) => item.id === id);
  const [note, setNote] = useState("");
  if (!application || application.status === "draft")
    return (
      <Empty
        title="No submitted application"
        href="/admin/applications"
        label="Application queue"
      >
        Select a submitted Diploma application to review.
      </Empty>
    );
  const inReview = ["submitted", "under review", "needs info"].includes(
    application.status,
  );
  return (
    <>
      <Heading
        eyebrow="DIPLOMA APPLICATION"
        title={application.name}
        action={<Badge>{application.status}</Badge>}
      >
        {application.instrument} · {application.credits} credits in{" "}
        {application.sittings} sitting(s) · {application.body}
      </Heading>
      <div className="two-column">
        <section className="panel">
          <h2>Document verification</h2>
          {application.documents.map((document) => (
            <DocumentReview
              key={document.id}
              document={document}
              applicationId={application.id}
              disabled={!inReview}
            />
          ))}
        </section>
        <section className="panel">
          <h2>Application decision</h2>
          <p>
            Theory Grade {application.theoryLevel} · Practical Grade{" "}
            {application.practicalLevel}
          </p>
          <p>English Language credit: {application.english ? "Yes" : "No"}</p>
          <Field label="Message to candidate">
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explain any requested documents or the next step."
            />
          </Field>
          {inReview && (
            <div className="stack">
              <button
                className="button"
                onClick={() =>
                  run({
                    type: "review-application",
                    id,
                    status: "shortlisted",
                    note,
                  })
                }
              >
                Shortlist candidate
                <CheckCircle2 size={16} />
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  run({
                    type: "review-application",
                    id,
                    status: "needs info",
                    note,
                  })
                }
              >
                Request more information
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  run({
                    type: "review-application",
                    id,
                    status: "rejected",
                    note,
                  })
                }
              >
                Reject application
              </button>
            </div>
          )}
          {application.status === "shortlisted" && (
            <Go href="/admin/schedule">Schedule entrance exam</Go>
          )}
          {application.note && <Notice>{application.note}</Notice>}
        </section>
      </div>
    </>
  );
}

function DocumentReview({
  document,
  applicationId,
  disabled,
}: {
  document: DocumentRecord;
  applicationId: string;
  disabled: boolean;
}) {
  const { run } = useDemo();
  const [note, setNote] = useState(document.note);
  return (
    <div className="document-row">
      <DocumentView document={document} />
      {!disabled && (
        <>
          <Field label={`Note for ${document.label}`}>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason if requesting a replacement"
            />
          </Field>
          <div className="form-actions">
            <button
              className="button small"
              onClick={() =>
                run({
                  type: "document",
                  id: applicationId,
                  documentId: document.id,
                  status: "verified",
                  note,
                })
              }
            >
              Verify
              <CheckCircle2 size={14} />
            </button>
            <button
              className="button secondary small"
              onClick={() =>
                run({
                  type: "document",
                  id: applicationId,
                  documentId: document.id,
                  status: "rejected",
                  note,
                })
              }
            >
              Request replacement
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Scheduling() {
  const { data, run } = useDemo();
  const [datetime, setDatetime] = useState("2026-12-12T10:00");
  const [venue, setVenue] = useState("MUSON Centre, Onikan");
  const [capacity, setCapacity] = useState(10);
  const [mode, setMode] = useState<"In person" | "Video">("In person");
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <Heading eyebrow="ENTRANCE EXAMINATIONS" title="Audition scheduling">
        Create a slot and assign shortlisted candidates.
      </Heading>
      <div className="two-column">
        <section>
          <h2>Available slots</h2>
          {data.slots.map((slot) => (
            <div className="panel space-top" key={slot.id}>
              <div className="section-title">
                <h3>{date(slot.date)}</h3>
                <Badge>{slot.mode}</Badge>
              </div>
              <p>
                {new Date(slot.date).toLocaleTimeString("en-GB", {
                  timeZone: "Africa/Lagos",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WAT · {slot.venue}
              </p>
              <p>
                {slot.applicationIds.length} / {slot.capacity} places assigned
              </p>
              {slot.applicationIds.map((id) => (
                <Notice key={id} tone="success">
                  {data.applications.find((item) => item.id === id)?.name}
                </Notice>
              ))}
              <button
                className="button secondary small space-top"
                disabled={!selected.length}
                onClick={() => {
                  if (
                    run({
                      type: "schedule",
                      slotId: slot.id,
                      applicationIds: selected,
                    })
                  )
                    setSelected([]);
                }}
              >
                Assign selected candidates
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
          {!data.slots.length && <Notice>No slots created yet.</Notice>}
          <h2 className="space-top">Shortlisted candidates</h2>
          {data.applications
            .filter((item) => item.status === "shortlisted")
            .map((item) => (
              <label className="check" key={item.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id),
                    )
                  }
                />
                {item.name} · {item.instrument}
              </label>
            ))}
        </section>
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            run({
              type: "create-slot",
              slot: {
                date: new Date(`${datetime}:00+01:00`).toISOString(),
                venue,
                capacity,
                mode,
              },
            });
          }}
        >
          <h2>Create an entrance slot</h2>
          <Field label="Date and time (WAT)">
            <input
              type="datetime-local"
              required
              value={datetime}
              onChange={(event) => setDatetime(event.target.value)}
            />
          </Field>
          <Field label="Practical audition format">
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as typeof mode)}
            >
              <option>In person</option>
              <option>Video</option>
            </select>
          </Field>
          <Field label="Venue or video instructions">
            <input
              required
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
            />
          </Field>
          <Field label="Candidate capacity">
            <input
              required
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </Field>
          <button className="button">
            Create slot
            <CalendarDays size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
