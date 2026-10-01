"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  Expand,
  FileCheck2,
  ShieldCheck,
  Upload,
  Video,
} from "lucide-react";
import { startTheory, useDemo } from "@/lib/store";
import {
  config,
  DAY,
  date,
  dateTime,
  level,
  money,
  title,
  type Registration,
} from "@/lib/workflows";
import { questions } from "@/lib/questions";
import { Notation } from "@/components/Notation";
import { CameraPreview } from "@/components/CameraPreview";
import { asset } from "@/lib/urls";
import { saveFile, useFileUrl } from "@/lib/files";
import { achievement, certificateUrl, downloadCertificate, publicCertificate } from "@/lib/certificates";
import {
  Badge,
  Empty,
  Field,
  Go,
  Heading,
  Notice,
  Stat,
  MockCheckout,
} from "@/components/ui";

export function Overview() {
  const { data } = useDemo();
  const entries = data.registrations.filter(
    (item) => item.candidateId === "ada",
  );
  const application = data.applications[0];
  return (
    <>
      <Heading
        eyebrow="YOUR MUSON JOURNEY"
        title={`Welcome back, ${data.profile.name.split(" ")[0]}.`}
        action={
          <Link className="button" href="/candidate/register">
            Register for an exam
            <ArrowRight size={16} />
          </Link>
        }
      >
        A little practice every day. A new milestone ahead.
      </Heading>
      <div className="stats">
        <Stat
          label="EXAM ENTRIES"
          value={entries.length}
          detail="December 2026 sitting"
        />
        <Stat
          label="AWAITING SUBMISSION"
          value={
            entries.filter((item) => !item.scores.length && !item.file).length
          }
          detail="Your next steps"
        />
        <Stat
          label="PUBLISHED RESULTS"
          value={entries.filter((item) => item.result).length}
          detail="Reviewed by MUSON"
        />
        <Stat
          label="CERTIFICATES"
          value={
            data.certificates.filter(
              (item) =>
                item.registrationId.startsWith("ada") &&
                item.status === "valid",
            ).length
          }
          detail="Your achievements"
        />
      </div>
      <div className="welcome-band">
        <div>
          <div className="eyebrow">DECEMBER 2026 SITTING</div>
          <h2>Your next chapter starts here.</h2>
          <p>
            {entries.length && entries.every(item => item.paid)
              ? "Your entries are confirmed. Continue your assessments and follow your progress below."
              : "Theory and practical entries are open. Complete your registration and prepare for your next grade."}
          </p>
        </div>
        <Go href="/graded-exams">Explore the examinations</Go>
      </div>
      <div className="two-column">
        <section>
          <div className="section-title">
            <h2>My examinations</h2>
            <Go href="/candidate/register">All entries</Go>
          </div>
          {entries.length ? (
            <div className="equal-columns">
              {entries.map((entry) => (
                <ExamCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <Empty
              title="Your next grade is waiting"
              href="/candidate/register"
              label="Start an entry"
            >
              Choose your grade, instrument and assessment for the December
              sitting.
            </Empty>
          )}
          <div className="section-title space-top">
            <h2>Diploma School</h2>
            <Badge>{application.status}</Badge>
          </div>
          <div className="exam-card">
            <div className="eyebrow">MUSON / MTN FOUNDATION</div>
            <h3>Two years. A lifetime in music.</h3>
            <p>
              Your Diploma application and audition details, together in one
              place.
            </p>
            <div className="card-bottom">
              <span>{application.instrument} · 2027 intake</span>
              <Go href="/candidate/application">
                {application.status === "draft"
                  ? "Continue application"
                  : "View application"}
              </Go>
            </div>
          </div>
        </section>
        <section>
          <div className="section-title">
            <h2>Latest updates</h2>
            <span className="eyebrow">{date(data.now)}</span>
          </div>
          <ul className="activity">
            {data.notifications.slice(0, 5).map((item) => (
              <li key={item.id}>
                <p>{item.text}</p>
                <small>{date(item.createdAt)}</small>
              </li>
            ))}
          </ul>
          <div className="space-top">
            <Image
              src={asset("demo/piano.jpg")}
              alt="A pianist at the keyboard"
              width={600}
              height={340}
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <p style={{ marginTop: 12, fontSize: 12 }}>
              Every performance begins with preparation.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function ExamCard({ entry }: { entry: Registration }) {
  return (
    <article className="exam-card">
      <div className="section-title">
        <span className="subject-icon">
          {entry.kind === "theory" ? (
            <BookOpen size={22} />
          ) : (
            <Video size={22} />
          )}
        </span>
        <Badge>
          {entry.result
            ? "published"
            : entry.paid
              ? entry.status
              : "payment due"}
        </Badge>
      </div>
      <small>{config.sitting.name}</small>
      <h3>{title(entry)}</h3>
      <p>
        {entry.kind === "theory"
          ? "Online assessment · 12 questions"
          : `${entry.subject} · Video performance`}
      </p>
      <div className="card-bottom">
        <small>
          {entry.paid ? "Entry confirmed" : money(config.fees[entry.kind])}
        </small>
        <Go
          href={
            entry.result
              ? "/candidate/results"
              : !entry.paid
                ? "/candidate/register"
                : `/candidate/${entry.kind === "theory" ? "theory" : "practical"}`
          }
        >
          {entry.result ? "View result" : "Open entry"}
        </Go>
      </div>
    </article>
  );
}

export function Profile() {
  const { data, run } = useDemo();
  const [profile, setProfile] = useState(data.profile);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [uploading, setUploading] = useState(false);
  const photo = useFileUrl(profile.photo);
  return (
    <>
      <Heading eyebrow="CANDIDATE DETAILS" title="My profile">
        Keep your details consistent with your exam documents.
      </Heading>
      <form
        className="panel"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(run({ type: "profile", profile }));
        }}
      >
        {photo && <Image src={photo} alt="Candidate profile photo" width={96} height={96} unoptimized style={{ objectFit: "cover", marginBottom: 20 }}/>}
        <Field label="Profile photo (fictional image only)"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={async event => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setPhotoError("Choose a JPG, PNG or WebP image."); return; }
          setUploading(true);
          try { const key = await saveFile(file); setProfile(current => ({ ...current, photo: key })); setPhotoError(""); setSaved(false); }
          catch (error) { setPhotoError((error as Error).message); }
          finally { setUploading(false); }
        }}/></Field>
        {photoError && <Notice tone="warning">{photoError}</Notice>}
        <div className="form-grid">
          <Field label="Full name">
            <input
              required
              value={profile.name}
              onChange={(event) =>
                setProfile({ ...profile, name: event.target.value })
              }
            />
          </Field>
          <Field label="Email address">
            <input
              type="email"
              required
              value={profile.email}
              onChange={(event) =>
                setProfile({ ...profile, email: event.target.value })
              }
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              value={profile.phone}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.target.value })
              }
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              required
              value={profile.birthDate}
              onChange={(event) =>
                setProfile({ ...profile, birthDate: event.target.value })
              }
            />
          </Field>
          <Field label="Parent or guardian name (under 18)">
            <input
              value={profile.guardian}
              onChange={(event) =>
                setProfile({ ...profile, guardian: event.target.value })
              }
            />
          </Field>
        </div>
        <Notice>
          Use fictional details only. Grade 5 prerequisites are unlocked when
          staff verify the theory and practical evidence in your application.
        </Notice>
        <button className="button" type="submit" disabled={uploading}>
          Save profile
          <CheckCircle2 size={16} />
        </button>
        {saved && <Notice tone="success">Profile saved.</Notice>}
      </form>
    </>
  );
}

export function Register() {
  const { data, run } = useDemo();
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState("Piano");
  const [theory, setTheory] = useState(true);
  const [practical, setPractical] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const entries = data.registrations.filter(
    (item) => item.candidateId === "ada",
  );
  const unpaid = entries.filter((item) => !item.paid);
  return (
    <>
      <Heading eyebrow="GRADED EXAMINATIONS" title="Exam registration">
        One sitting. Your next milestone in music.
      </Heading>
      <MockCheckout key={String(checkout)} open={checkout} amount={unpaid.reduce((sum, entry) => sum + config.fees[entry.kind], 0)} onClose={() => setCheckout(false)} onComplete={() => { run({ type: "pay" }); setCheckout(false); }} />
      <div className="two-column">
        <section>
          {entries.length < 2 && (
            <form
              className="panel"
              onSubmit={(event) => {
                event.preventDefault();
                run({
                  type: "register",
                  grade,
                  subject,
                  kinds: [
                    ...(theory &&
                    !entries.some((item) => item.kind === "theory")
                      ? ["theory" as const]
                      : []),
                    ...(practical &&
                    !entries.some((item) => item.kind === "practical")
                      ? ["practical" as const]
                      : []),
                  ],
                });
              }}
            >
              <h2>Choose your examinations</h2>
              <Field label="Sitting">
                <select>
                  <option>December 2026</option>
                </select>
              </Field>
              <div className="form-grid">
                <Field label="Grade">
                  <select
                    value={grade}
                    onChange={(event) => setGrade(Number(event.target.value))}
                  >
                    {config.levels.map((value) => (
                      <option key={value} value={value}>
                        {level(value)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Instrument or voice">
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  >
                    {config.subjects.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              </div>
              {!entries.some((item) => item.kind === "theory") && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={theory}
                    onChange={(event) => setTheory(event.target.checked)}
                  />
                  Music Theory <strong>{money(config.fees.theory)}</strong>
                </label>
              )}
              {!entries.some((item) => item.kind === "practical") && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={practical}
                    onChange={(event) => setPractical(event.target.checked)}
                  />
                  Practical <strong>{money(config.fees.practical)}</strong>
                </label>
              )}
              <Notice>
                Grades 6 to 8 require verified Grade 5 evidence. Fees shown are
                illustrative.
              </Notice>
              <button className="button">
                Add exam entries
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          {entries.length > 0 && (
            <div className="stack">
              {entries.map((entry) => (
                <ExamCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
        <section className="panel">
          <div className="eyebrow">ENTRY SUMMARY</div>
          <h2 className="space-top">December 2026</h2>
          {entries.map((entry) => (
            <div className="total-row" key={entry.id} style={{ fontSize: 13 }}>
              <span>{title(entry)}</span>
              <span>
                {entry.paid ? (
                  <Badge>paid</Badge>
                ) : (
                  money(config.fees[entry.kind])
                )}
              </span>
            </div>
          ))}
          <div className="total-row">
            <span>Due now</span>
            <strong>
              {money(
                unpaid.reduce((sum, item) => sum + config.fees[item.kind], 0),
              )}
            </strong>
          </div>
          {unpaid.length > 0 ? (
            <button className="button" onClick={() => setCheckout(true)}>
              Pay mock fee
              <ArrowRight size={16} />
            </button>
          ) : (
            <p>
              {entries.length
                ? "Your entries are paid and confirmed."
                : "Add an exam to begin."}
            </p>
          )}
          <Notice>
            No money will be charged. This presentation uses simulated payments.
          </Notice>
        </section>
      </div>
    </>
  );
}

export function Theory() {
  const { data, run } = useDemo();
  const entry = data.registrations.find((item) => item.id === "ada-theory");
  const [checks, setChecks] = useState([false, false, false]);
  const [now, setNow] = useState(Date.now);
  const [warning, setWarning] = useState("");
  const attempt = entry?.attempt;
  useEffect(() => {
    if (!attempt || attempt.submitted) return;
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (time >= attempt.deadline)
        run({ type: "submit-theory", id: "ada-theory", now: time });
      else if (time >= attempt.questionDeadline)
        run({ type: "next-question", id: "ada-theory", now: time });
    }, 500);
    const flag = (reason: string) => {
      setWarning(reason);
      run({ type: "flag", id: "ada-theory", reason });
    };
    const visibility = () => {
      if (document.hidden)
        flag("Tab switch recorded. Return to your examination.");
    };
    const fullscreen = () => {
      if (!document.fullscreenElement)
        flag("Fullscreen exited. This event has been recorded.");
    };
    const prevent = (event: Event) => event.preventDefault();
    const leaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", leaving);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", fullscreen);
    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", leaving);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", fullscreen);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
    };
  }, [attempt, run]);
  useEffect(() => {
    if (attempt?.submitted && document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  }, [attempt?.submitted]);
  if (!entry?.paid)
    return (
      <Empty
        title="Register for Music Theory"
        href="/candidate/register"
        label="Exam registration"
      >
        A paid theory entry is required before you can start.
      </Empty>
    );
  const fullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setWarning(
        "Fullscreen is unavailable. Continue in supervised demo mode.",
      );
    }
  };
  const begin = () => {
    void fullscreen();
    startTheory(entry.id);
  };
  if (attempt?.submitted)
    return (
      <>
        <Heading
          eyebrow="THEORY COMPLETE"
          title="Your paper has been submitted."
        />
        <div className="panel">
          <FileCheck2 color="var(--green)" size={38} />
          <div className="score-number">
            {entry.scores[0]?.total}
            <small> / 100</small>
          </div>
          <Badge>Provisional result</Badge>
          <p className="space-top">
            Your final result follows the integrity review. Your certificate
            will be available within 3 to 7 days after clearance.
          </p>
          <Link className="button" href="/candidate/results">
            View result
            <ArrowRight size={16} />
          </Link>
        </div>
      </>
    );
  if (!attempt)
    return (
      <>
        <Heading eyebrow="DECEMBER 2026 · ONLINE THEORY" title={title(entry)}>
          A quiet room, a clear mind, and a little preparation.
        </Heading>
        <div className="two-column">
          <section className="panel">
            <h2>Before you begin</h2>
            {[
              [
                ShieldCheck,
                "Identity check",
                "Demo identity confirmed. No ID is captured.",
              ],
              [
                Camera,
                "Webcam & room check",
                "Optional live preview; no images or video are saved.",
              ],
              [
                Expand,
                "Exam conditions",
                "12 minutes, 60 seconds per question. Answers lock when you move on.",
              ],
            ].map(([Icon, name, detail], index) => {
              const Symbol = Icon as typeof Camera;
              return (
                <div className="readiness" key={index}>
                  <Symbol size={28} />
                  <div>
                    <strong>{String(name)}</strong>
                    <p>{String(detail)}</p>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={checks[index]}
                        onChange={(event) =>
                          setChecks(
                            checks.map((value, position) =>
                              position === index ? event.target.checked : value,
                            ),
                          )
                        }
                      />
                      Confirmed
                    </label>
                  </div>
                </div>
              );
            })}
            <button
              className="button space-top"
              disabled={!checks.every(Boolean)}
              onClick={begin}
            >
              Begin examination
              <ArrowRight size={16} />
            </button>
          </section>
          <aside>
            <CameraPreview />
            <Notice tone="warning">
              This is a mock assessment. Browser warnings are not secure
              proctoring. No webcam images are captured.
            </Notice>
            <h3 className="space-top">Paper at a glance</h3>
            <ul className="guidelines">
              <li>12 questions, including notation and listening</li>
              <li>Shuffled questions and answer choices</li>
              <li>Unanswered questions score zero</li>
              <li>Automatic submission when time expires</li>
              <li>Tab switches and fullscreen exits are logged</li>
            </ul>
          </aside>
        </div>
      </>
    );
  const question = questions.find(
    (item) => item.id === attempt.order[attempt.index],
  )!;
  const seconds = Math.min(config.theoryMinutes * 60, Math.max(0, Math.ceil((attempt.deadline - now) / 1000)));
  return (
    <div className="exam-room">
      <Heading eyebrow={title(entry)} title="Theory examination" />
      <div className="exam-toolbar">
        <span>
          Question {attempt.index + 1} of {attempt.order.length}
        </span>
        <span className="timer">
          <Clock3 size={17} />
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
        </span>
        <span>
          {Math.min(config.questionSeconds, Math.max(0, Math.ceil((attempt.questionDeadline - now) / 1000)))}s
          this question
        </span>
        <button
          className="icon-button"
          aria-label="Enter fullscreen"
          title="Enter fullscreen"
          onClick={fullscreen}
        >
          <Expand size={18} />
        </button>
      </div>
      {warning && <Notice tone="warning">{warning}</Notice>}
      <section className="question">
        <div className="eyebrow">{question.topic}</div>
        <h2>{question.prompt}</h2>
        {question.media === "notation" && (
          <Notation />
        )}
        {question.media === "audio" && (
          <audio
            controls
            src={asset("demo/interval.wav")}
            aria-label="Listen to the interval"
          />
        )}
        <div className="question-options">
          {attempt.options[question.id].map((choice) => (
            <label className="question-option" key={choice}>
              <input
                type="radio"
                name={question.id}
                checked={attempt.answers[question.id] === choice}
                onChange={() =>
                  run({
                    type: "answer",
                    id: entry.id,
                    answer: choice,
                    now: Date.now(),
                  })
                }
              />
              {choice}
            </label>
          ))}
        </div>
        <div className="form-actions">
          <button
            className="button"
            onClick={() =>
              run({ type: "next-question", id: entry.id, now: Date.now() })
            }
          >
            {attempt.index === 11 ? "Finish paper" : "Next question"}
            <ArrowRight size={16} />
          </button>
          <button
            className="button secondary"
            onClick={() => {
              if (confirm("Submit now? Unanswered questions will score zero."))
                run({ type: "submit-theory", id: entry.id, now: Date.now() });
            }}
          >
            Submit paper
          </button>
        </div>
      </section>
    </div>
  );
}

export function Practical() {
  const { data, run } = useDemo();
  const entry = data.registrations.find((item) => item.id === "ada-practical");
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const url = useFileUrl(entry?.file || file, true);
  const [clock, setClock] = useState(data.now);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setClock(data.now + Date.now() - started), 1000);
    return () => clearInterval(timer);
  }, [data.now]);
  if (!entry?.paid)
    return (
      <Empty
        title="Register for a practical examination"
        href="/candidate/register"
        label="Exam registration"
      >
        Confirm your practical entry to open the video submission window.
      </Empty>
    );
  const remaining = Math.max(0, Math.floor((Date.parse(config.sitting.closesAt) - Math.max(data.now, clock)) / 1000));
  const days = Math.floor(remaining / 86400);
  const timeLeft = `${days}d ${String(Math.floor(remaining / 3600) % 24).padStart(2, "0")}h ${String(Math.floor(remaining / 60) % 60).padStart(2, "0")}m ${String(remaining % 60).padStart(2, "0")}s`;
  const missingBirthDate = !data.profile.birthDate || !Number.isFinite(Date.parse(data.profile.birthDate));
  return (
    <>
      <Heading
        eyebrow="VIDEO PERFORMANCE"
        title={title(entry)}
        action={
          <Badge>
            {entry.file ? "submitted" : remaining ? "window open" : "absent"}
          </Badge>
        }
      >
        One performance. One continuous take. Your moment.
      </Heading>
      <div className="two-column">
        <section className="panel">
          <h2>
            {entry.file
              ? "Your submitted performance"
              : "Prepare your submission"}
          </h2>
          {url && (
            <video
              className="media-player"
              src={url}
              controls
              preload="metadata"
            />
          )}
          {entry.file ? (
            <Notice tone="success">
              Submitted on {date(entry.submittedAt!)}. Your declaration is
              recorded. No replacement upload is permitted.
            </Notice>
          ) : remaining ? (
            <>
              <div className="upload">
                <Upload size={28} color="var(--green)" />
                <Field label="Performance video">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={busy}
                    onChange={async (event) => {
                      const selected = event.target.files?.[0];
                      if (!selected) return;
                      setBusy(true);
                      try {
                        setFile(await saveFile(selected, true));
                        setFileName(selected.name);
                        setError("");
                      } catch (error) {
                        setError((error as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </Field>
                <small>MP4, WebM or MOV · Up to 50 MB for this prototype</small>
                <div className="form-actions">
                  <button
                    className="button secondary small"
                    disabled={busy}
                    onClick={() => {
                      setFile("sample");
                      setFileName("Bundled sample performance.mp4");
                      setError("");
                    }}
                  >
                    Use sample video
                    <Video size={14} />
                  </button>
                </div>
              </div>
              {file === "sample" && (
                <Notice>
                  Bundled sample: an illustrative piano clip, not an assessed
                  candidate performance.
                </Notice>
              )}
              {fileName && <p>{fileName}</p>}
              {missingBirthDate && <Notice tone="warning">Add your date of birth before submitting. <Go href="/candidate/profile">Complete My profile</Go></Notice>}
              {!missingBirthDate && <p className="space-top"><Go href="/candidate/profile">Review birth date and guardian details</Go></p>}
              <label className="check">
                <input
                  type="checkbox"
                  checked={declaration}
                  onChange={(event) => setDeclaration(event.target.checked)}
                />
                I declare that this is one continuous, unedited performance by
                the named candidate. I am the candidate or their named
                parent/guardian.
              </label>
              <button
                className="button"
                disabled={!file || !declaration || busy || missingBirthDate}
                onClick={() =>
                  run({
                    type: "submit-video",
                    id: entry.id,
                    file,
                    fileName,
                    declaration,
                  })
                }
              >
                Submit performance
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <Notice tone="warning">
              The submission window has closed. This entry is marked absent.
            </Notice>
          )}
          {error && <Notice tone="warning">{error}</Notice>}
        </section>
        <aside>
          <div className="eyebrow">SUBMISSION WINDOW</div>
          <div className="countdown" aria-label="Time remaining">{timeLeft}</div>
          <p>Closes {dateTime(config.sitting.closesAt)}</p>
          <div className="space-top">
            <div className="eyebrow">YOUR RECORDING CODE</div>
            <div className="code">{entry.code}</div>
            <p>Say this code at the beginning of your recording.</p>
          </div>
          <h3 className="space-top">Recording requirements</h3>
          <ul className="guidelines">
            <li>One continuous take, without edits. Keep the camera fixed.</li>
            <li>
              Keep your face, hands and entire instrument visible. For piano,
              show the full keyboard.
            </li>
            <li>Say your name, grade, pieces and recording code.</li>
            <li>
              Show photo ID for Grades 6 to 8. Use fictional documents in this
              demo.
            </li>
            <li>Submit once within the 30-day window.</li>
            <li>A parent or guardian must sign for candidates under 18.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}

export function Results() {
  const { data } = useDemo();
  const [error, setError] = useState("");
  const entries = data.registrations.filter(
    (item) => item.candidateId === "ada",
  );
  const certificates = data.certificates.filter((item) =>
    item.registrationId.startsWith("ada"),
  );
  const download = async (certificate: typeof publicCertificate) => {
    try {
      await downloadCertificate(certificate);
    } catch {
      setError(
        "The PDF could not be generated. Check the candidate details and retry.",
      );
    }
  };
  return (
    <>
      <Heading eyebrow="YOUR ACHIEVEMENTS" title="Results & certificates">
        Every result is a step forward.
      </Heading>
      {!entries.some((item) => item.scores.length) ? (
        <Empty
          title="Your results will appear here"
          href="/candidate"
          label="My examinations"
        >
          Complete your assessments to receive a provisional score.
        </Empty>
      ) : (
        <div className="equal-columns">
          {entries
            .filter((item) => item.scores.length)
            .map((entry) => (
              <article key={entry.id} className="exam-card">
                <div className="section-title">
                  <h3>{title(entry)}</h3>
                  <Badge>{entry.result ? "published" : "provisional"}</Badge>
                </div>
                <div className="score-number">
                  {entry.result?.total ?? entry.scores[0].total}
                  <small> / 100</small>
                </div>
                <p>
                  {achievement(entry.result?.total ?? entry.scores[0].total)}{" "}
                  · {config.sitting.name}
                </p>
                {entry.kind === "practical" ? (
                  <ul className="guidelines">
                    {config.rubric.map((criterion, index) => (
                      <li key={criterion.name}>
                        {criterion.name}:{" "}
                        {
                          entry.scores[
                            entry.result ? entry.result.version - 1 : 0
                          ].marks[index]
                        }{" "}
                        / {criterion.max}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="space-top">
                    {entry.attempt
                      ? `${entry.scores[0].marks.filter(Boolean).length} of 12 questions correct.`
                      : "Automatically marked."}
                  </p>
                )}
                <p className="space-top">{entry.kind === "theory" && entry.result ? "Integrity review complete. Final result published." : entry.scores[entry.result ? entry.result.version - 1 : 0]?.comments}</p>
                {!entry.result && (
                  <Notice>
                    Provisional until staff review and publish results.
                  </Notice>
                )}
                {entry.result &&
                  !certificates.some(
                    (item) =>
                      item.registrationId === entry.id &&
                      item.status === "valid",
                  ) &&
                  entry.result.total >= config.passMark && (
                    <Notice>
                      Certificate pending. Issued 3 to 7 days after review.
                    </Notice>
                  )}
                {entry.result && entry.kind === "practical" && (
                  <div className="card-bottom">
                    <Go href="/candidate/appeals">Request a review</Go>
                    <small>
                      Within {config.appealDays} days of publication
                    </small>
                  </div>
                )}
              </article>
            ))}
        </div>
      )}
      <div className="section-title space-top">
        <h2>My certificates</h2>
        <Award size={22} color="var(--gold)" />
      </div>
      {error && <Notice tone="warning">{error}</Notice>}
      <div className="stack">
        {[...certificates, publicCertificate].map((certificate) => (
          <div key={certificate.id} className="exam-card">
            <div className="section-title">
              <div>
                <h3>{certificate.exam}</h3>
                <p>
                  {certificate.number} · {date(certificate.issuedAt)}
                </p>
              </div>
              <Badge>{certificate.status}</Badge>
            </div>
            {certificate.id === "public-sample" && (
              <p>
                Preloaded Grade 4 sample, earned before this Grade 5 sitting.
              </p>
            )}
            <div className="form-actions">
              <button
                className="button secondary"
                onClick={() => download(certificate)}
              >
                <Download size={16} />
                Download sample PDF
              </button>
              <Go
                href={`/verify?${new URL(certificateUrl(certificate, "https://example.org")).searchParams}`}
              >
                Check certificate
              </Go>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Appeals() {
  const { data, run } = useDemo();
  const entry = data.registrations.find((item) => item.id === "ada-practical");
  const appeal = data.appeals.find((item) => item.registrationId === entry?.id);
  const [reason, setReason] = useState("");
  return (
    <>
      <Heading eyebrow="RESULT REVIEW" title="Appeals">
        A fresh review, by a different examiner.
      </Heading>
      {appeal ? (
        <div className="panel">
          <Badge>{appeal.status}</Badge>
          <h2 className="space-top">{entry && title(entry)}</h2>
          <p>{appeal.reason}</p>
          {appeal.outcome ? (
            <Notice tone="success">{appeal.outcome}</Notice>
          ) : (
            <Notice>
              Your original mark remains on record while the independent review
              is in progress.
            </Notice>
          )}
        </div>
      ) : entry?.result ? (
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            run({ type: "appeal", id: entry.id, reason });
          }}
        >
          <h2>
            {title(entry)} · {entry.result.total}%
          </h2>
          <p>
            Appeal deadline:{" "}
            {date(entry.result.publishedAt + config.appealDays * DAY)}
          </p>
          <Field label="Reason for appeal">
            <textarea
              required
              minLength={10}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Tell us which part of your assessment you would like reviewed."
            />
          </Field>
          <Notice>
            Illustrative policy: 7 days, no appeal fee. MUSON will confirm the
            final policy.
          </Notice>
          <button className="button">
            Submit appeal
            <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        <Empty title="No result available for appeal">
          You can appeal a practical result after it has been published.
        </Empty>
      )}
    </>
  );
}
