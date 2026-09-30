"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { asset, verificationUrl } from "@/lib/urls";
import { useDemo } from "@/lib/store";
import { candidateDestination } from "@/lib/auth";
import { clearFiles } from "@/lib/files";
import { config, date, money, type Role } from "@/lib/workflows";
import { publicCertificate } from "@/lib/certificates";
import { Badge, Field, Go, Notice } from "@/components/ui";

export function Home() {
  return (
    <>
      <section className="hero">
        <Image
          src={asset("demo/muson-gala.jpg")}
          alt="Orchestra and choir performing together at the MUSON Centre"
          fill
          priority
          sizes="100vw"
        />
        <div>
          <span className="eyebrow">
            THE MUSICAL SOCIETY OF NIGERIA · EST. 1983
          </span>
          <h1>MUSON</h1>
          <p>
            Music that moves us.
            <br />
            Education that stays with us.
          </p>
          <div className="form-actions">
            <Link href="/diploma" className="button white">
              Explore Diploma School
              <ArrowRight size={17} />
            </Link>
            <Link href="/graded-exams" className="text-link">
              Graded examinations
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="public-section">
        <span className="eyebrow">FIND YOUR NEXT CHAPTER</span>
        <div className="section-title">
          <h2>A place for every musician.</h2>
          <Go href="/about">Our story</Go>
        </div>
        <div className="offerings">
          {[
            [
              "01",
              "Diploma School",
              "Two years of focused study, performance and musical growth, supported by the MTN Foundation.",
              "/diploma",
            ],
            [
              "02",
              "Graded Examinations",
              "Recognise your progress in theory and practical music, from Preparatory to Grade 8.",
              "/graded-exams",
            ],
            [
              "03",
              "Basic School",
              "Individual music tuition for beginners and developing musicians of all ages.",
              "/basic-school",
            ],
          ].map(([number, name, text, href]) => (
            <article className="offering" key={number}>
              <span>{number}</span>
              <h3>{name}</h3>
              <p>{text}</p>
              <Go href={href}>Explore programme</Go>
            </article>
          ))}
        </div>
      </section>
      <section className="public-section alt">
        <div className="two-column">
          <div>
            <span className="eyebrow">ON THE CALENDAR</span>
            <h2>What comes next.</h2>
            <p>Illustrative dates for the presentation.</p>
            <div className="event-row">
              <div className="event-date">
                <strong>01</strong>DEC
              </div>
              <div>
                <h3>December graded examinations</h3>
                <p>Theory papers and a 30-day practical submission window.</p>
              </div>
              <Go href="/candidate/register">Register</Go>
            </div>
            <div className="event-row">
              <div className="event-date">
                <strong>12</strong>DEC
              </div>
              <div>
                <h3>Diploma entrance examinations</h3>
                <p>Written paper, practical audition and aural interview.</p>
              </div>
              <Go href="/candidate/application">Apply</Go>
            </div>
          </div>
          <div className="certificate-preview">
            <Award size={30} color="var(--gold)" />
            <h2>A qualification you can check.</h2>
            <p>Look up a certificate number and confirm its sample record.</p>
            <Link className="button secondary space-top" href="/verify">
              Check a certificate
              <ShieldCheck size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function PublicPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="public-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <section className="public-content">{children}</section>
    </>
  );
}

export function Diploma() {
  return (
    <PublicPage
      eyebrow="MUSON / MTN FOUNDATION"
      title="Diploma School"
      intro="A two-year programme for musicians ready to deepen their craft and build a professional future."
    >
      <div className="two-column">
        <div>
          <h2>Your next movement.</h2>
          <p>
            The Diploma programme brings together instrumental or vocal study,
            music theory, ensemble work and performance. The MTN Foundation
            scholarship supports eligible students through the programme.
          </p>
          <h2>Entry requirements</h2>
          <ul>
            <li>
              Five O&apos;Level / SSCE credits, including English Language, in
              no more than two sittings.
            </li>
            <li>
              Grade 5 or higher in theory and practical from MUSON, ABRSM or
              Trinity.
            </li>
            <li>A main instrument or voice and supporting certificates.</li>
            <li>
              Successful written examination, practical audition and aural
              interview.
            </li>
          </ul>
          <Notice>
            2027 intake dates and fees shown here are illustrative and subject
            to MUSON approval.
          </Notice>
          <Link className="button" href="/candidate/application">
            Start application
            <ArrowRight size={16} />
          </Link>
        </div>
        <aside>
          <Image
            src={asset("demo/piano.jpg")}
            alt="Piano keyboard"
            width={700}
            height={460}
            className="programme-image"
          />
          <div className="space-top">
            <span className="eyebrow">AT A GLANCE</span>
            <h3 className="space-top">Two years. A lifetime of music.</h3>
            <p>Instrumental / vocal study · Performance · Music theory</p>
            <p>
              Illustrative application fee: {money(config.fees.application)}
            </p>
            <Go href="/contact">Speak with the school</Go>
          </div>
        </aside>
      </div>
    </PublicPage>
  );
}

export function GradedExams() {
  return (
    <PublicPage
      eyebrow="MUSON EXAMINATIONS"
      title="Graded music examinations"
      intro="A structured path from your first musical steps to advanced performance."
    >
      <div className="two-column">
        <div>
          <h2>Progress, recognised.</h2>
          <p>
            MUSON offers theory and practical examinations from Preparatory to
            Grade 8. Sittings are planned for May and December; this
            presentation uses December 2026.
          </p>
          <div className="equal-columns">
            <div>
              <GraduationCap size={28} color="var(--green)" />
              <h3 className="space-top">Music Theory</h3>
              <p>
                A timed online paper with notation and listening questions. This
                sample paper has 12 questions.
              </p>
              <strong>{money(config.fees.theory)}</strong>
            </div>
            <div>
              <Award size={28} color="var(--green)" />
              <h3 className="space-top">Practical</h3>
              <p>
                A recorded performance submitted within the sitting window and
                assessed against a rubric.
              </p>
              <strong>{money(config.fees.practical)}</strong>
            </div>
          </div>
          <h2 className="space-top">Instruments & voice</h2>
          <p>{config.subjects.join(" · ")}</p>
          <Notice>
            Grades 6–8 require verified Grade 5 theory and practical evidence.
            Fees and assessment rules are illustrative.
          </Notice>
          <Link className="button" href="/candidate/register">
            Register for December
            <ArrowRight size={16} />
          </Link>
        </div>
        <aside>
          <h2>December 2026</h2>
          <div className="event-row">
            <CalendarDays size={24} />
            <div>
              <h3>1–30 December</h3>
              <p>
                30-day practical submission window, closing 31 December at 00:00
                UTC.
              </p>
            </div>
          </div>
          <ul>
            <li>Register and complete a mock payment.</li>
            <li>Sit the theory paper and submit your practical video.</li>
            <li>Receive results after marking and integrity review.</li>
            <li>
              Passing results can receive a sample certificate 3–7 days after
              clearance.
            </li>
          </ul>
          <Go href="/verify">Verify a sample certificate</Go>
        </aside>
      </div>
    </PublicPage>
  );
}

export function Verify() {
  const query = useSearchParams().get("number") || "";
  const { data } = useDemo();
  const [number, setNumber] = useState(query);
  const [lookup, setLookup] = useState(query);
  const [qr, setQr] = useState("");
  const certificate =
    data.certificates.find((item) => item.number === lookup) ||
    (lookup === publicCertificate.number ? publicCertificate : undefined);
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(
      verificationUrl(
        publicCertificate.number,
        process.env.NEXT_PUBLIC_SITE_ORIGIN || window.location.origin,
      ),
      { margin: 1, width: 180 },
    ).then((value) => {
      if (active) setQr(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <PublicPage
      eyebrow="CERTIFICATE REGISTRY · DEMONSTRATION"
      title="Check a certificate"
      intro="Enter a certificate number to view its sample record."
    >
      <div className="two-column">
        <div>
          <form
            className="verify-form"
            onSubmit={(event) => {
              event.preventDefault();
              setLookup(number.trim().toUpperCase());
            }}
          >
            <Field label="Certificate number">
              <input
                required
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="MUSON-DEMO-2026"
              />
            </Field>
            <button className="button" type="submit">
              <Search size={16} />
              Verify
            </button>
          </form>
          {lookup &&
            (certificate ? (
              <section className="panel" aria-live="polite">
                <div className="section-title">
                  <ShieldCheck size={29} color="var(--green)" />
                  <Badge>{certificate.status}</Badge>
                </div>
                <h2>
                  {certificate.status === "valid"
                    ? "Valid sample certificate"
                    : `Certificate ${certificate.status}`}
                </h2>
                <p>{certificate.number}</p>
                <div className="total-row">
                  <span>Candidate</span>
                  <strong>{certificate.candidate}</strong>
                </div>
                <p>
                  {certificate.exam} · Grade {certificate.grade}
                </p>
                <p>
                  Score: {certificate.mark}% · Issued{" "}
                  {date(certificate.issuedAt)}
                </p>
                <Notice
                  tone={certificate.status === "valid" ? "success" : "warning"}
                >
                  {certificate.id === "public-sample"
                    ? "Static sample record. This is not a real qualification."
                    : "Browser-local demo record. Changes are not shared with other devices."}
                </Notice>
              </section>
            ) : (
              <Notice tone="warning">
                No record found for {lookup}. Check the number. Certificates
                issued in another browser are not available here.
              </Notice>
            ))}
          <Notice>
            This prototype is not an authoritative MUSON registry. Newly issued
            or cancelled records are stored only in the presenting browser.
          </Notice>
        </div>
        <aside className="certificate-preview">
          <span className="sample-mark">
            PUBLIC SAMPLE · NOT AN OFFICIAL CERTIFICATE
          </span>
          <h2>Scan the sample</h2>
          <h3>{publicCertificate.candidate}</h3>
          <p>Grade 5 · Music Theory</p>
          {qr && (
            <Image
              src={qr}
              alt="QR code for public sample certificate verification"
              width={180}
              height={180}
              unoptimized
            />
          )}
          <p>{publicCertificate.number}</p>
          <button
            className="button secondary small space-top"
            onClick={() => {
              setNumber(publicCertificate.number);
              setLookup(publicCertificate.number);
            }}
          >
            Look up sample
            <ArrowRight size={14} />
          </button>
          <Notice>
            This preloaded record works across devices once hosted. A localhost
            QR cannot be opened from a phone.
          </Notice>
        </aside>
      </div>
    </PublicPage>
  );
}

export function BasicSchool() {
  return (
    <PublicPage
      eyebrow="LEARNING FOR EVERY AGE"
      title="Basic School"
      intro="Begin an instrument, return to music, or take your playing further."
    >
      <div className="two-column">
        <div>
          <h2>Start where you are.</h2>
          <p>
            Build confidence through individual tuition, regular practice and
            performance. The Basic School provides a foundation for lifelong
            music-making and preparation for graded examinations.
          </p>
          <p>{config.subjects.join(" · ")}</p>
          <Go href="/contact">Ask about tuition</Go>
        </div>
        <Image
          src={asset("demo/piano.jpg")}
          alt="Piano keys ready for practice"
          width={700}
          height={460}
          className="programme-image"
        />
      </div>
    </PublicPage>
  );
}

export function About() {
  return (
    <PublicPage
      eyebrow="THE MUSICAL SOCIETY OF NIGERIA"
      title="About MUSON"
      intro="A home for music, education and performance in Lagos since 1983."
    >
      <div className="two-column">
        <div>
          <h2>Rooted in music. Open to possibility.</h2>
          <p>
            MUSON nurtures musical talent through teaching, examinations and
            performance. Its Centre in Onikan brings students, professional
            musicians and audiences together.
          </p>
          <p>
            From a first lesson to the concert stage, musical education sits at
            the heart of the Society&apos;s work.
          </p>
          <Go href="/contact">Visit the MUSON Centre</Go>
        </div>
        <Image
          src={asset("demo/muson-gala.jpg")}
          alt="MUSON gala concert featuring orchestra and choir"
          width={768}
          height={512}
          className="programme-image"
        />
      </div>
    </PublicPage>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <PublicPage
      eyebrow="VISIT & CONTACT"
      title="MUSON Centre"
      intro="8/9 Marina Road, Onikan, Lagos, Nigeria."
    >
      <div className="two-column">
        <div>
          <h2>We look forward to hearing from you.</h2>
          <p>School enquiries, graded examinations and visits to the Centre.</p>
          <p>
            Telephone:{" "}
            <a className="text-link" href="tel:+2348077607675">
              +234 807 760 7675
            </a>
          </p>
          <a
            className="text-link"
            target="_blank"
            rel="noreferrer"
            href="https://www.google.com/maps/search/?api=1&query=MUSON+Centre+Onikan+Lagos"
          >
            <MapPin size={17} />
            Find us on the map
            <ArrowUpRight size={15} />
          </a>
        </div>
        <form
          className="panel"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <h2>Make an enquiry</h2>
          <Field label="Name">
            <input name="name" required />
          </Field>
          <Field label="Email">
            <input name="email" type="email" required />
          </Field>
          <Field label="Message">
            <textarea name="message" required />
          </Field>
          <Notice>Demo form only. Your message is not sent or stored.</Notice>
          <button className="button">
            Submit demo enquiry
            <ArrowRight size={16} />
          </button>
          {sent && (
            <Notice tone="success">
              Demo acknowledgement recorded on this page. No email was sent.
            </Notice>
          )}
        </form>
      </div>
    </PublicPage>
  );
}

export function Login() {
  return <AccountAccess signup={false} />;
}

export function SignUp() {
  return <AccountAccess signup />;
}

function PasswordField({ label, name, signup }: { label: string; name: string; signup: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="password-input">
        <input id={name} name={name} type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 8 : undefined} required />
        <button className="icon-button" type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} title={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function AccountAccess({ signup }: { signup: boolean }) {
  const { account, signedIn, signUp, signIn, signOut, reset } = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const destination = candidateDestination(params.get("next"));
  const next = `?next=${encodeURIComponent(destination)}`;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);
  return (
    <section className="account-section">
      <div className="account-form">
        <div className="account-image">
          <Image src={asset("demo/muson-gala.jpg")} alt="MUSON orchestra and choir on stage" fill sizes="(max-width: 520px) 100vw, 440px" priority />
        </div>
        <header className="account-heading">
          <span className="eyebrow">MUSON STUDENT PORTAL</span>
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p>{signup ? "Your next musical chapter starts here." : "Log in to your student account."}</p>
        </header>
        <Notice tone="warning">Demo only. Use fictional details and a password you do not use elsewhere. This account stays in this browser.</Notice>
        {signedIn && <p className="account-switch"><Link className="text-link" href={destination}>Continue to my portal <ArrowRight size={16} /></Link></p>}
        {signup && account ? (
          <Notice>An account already exists in this browser. <Link className="text-link" href={`/login${next}`}>Log in to continue</Link></Notice>
        ) : (
          <form aria-label={signup ? "Create account" : "Log in"} aria-busy={busy} onChange={() => setError("")} onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            const values = new FormData(event.currentTarget);
            const email = String(values.get("email") || "");
            const password = String(values.get("password") || "");
            if (signup && password !== values.get("confirm-password")) {
              setError("Passwords do not match.");
              return;
            }
            setBusy(true);
            setError("");
            try {
              if (signup) await signUp(String(values.get("name") || ""), email, password);
              else await signIn(email, password);
              router.replace(destination);
            } catch (failure) {
              setError(failure instanceof Error ? failure.message : "Unable to open your account. Please try again.");
            } finally {
              setBusy(false);
            }
          }}>
            <fieldset disabled={busy} className="account-fields">
              {signup && <Field label="Full name"><input name="name" autoComplete="name" placeholder="Tola Bello" minLength={2} required /></Field>}
              <Field label="Email address"><input name="email" type="email" autoComplete="username" placeholder="tola@example.test" required /></Field>
              <PasswordField label="Password" name="password" signup={signup} />
              {signup && <>
                <PasswordField label="Confirm password" name="confirm-password" signup />
                <label className="check"><input type="checkbox" required />I understand this is a demo account, not an official MUSON registration.</label>
              </>}
              {error && <div className="account-error" role="alert">{error}</div>}
              <button className="button account-submit" type="submit">{busy ? "Please wait..." : signup ? "Create account" : "Log in"}<ArrowRight size={17} /></button>
            </fieldset>
          </form>
        )}
        <p className="account-switch">{signup ? "Already have an account? " : "New to MUSON? "}<Link className="text-link" href={`${signup ? "/login" : "/signup"}${next}`}>{signup ? "Log in" : "Create an account"}</Link></p>
        {!signup && <>
          <button type="button" className="text-link account-recovery" aria-expanded={recovery} onClick={() => setRecovery(!recovery)}>Forgot password?</button>
          {recovery && <div className="account-reset">
            <h2>Reset demo account</h2>
            <Notice tone="warning">No recovery email is sent. Resetting deletes this browser&apos;s account, saved progress and uploads. You can then create a new demo account.</Notice>
            <button className="button secondary" disabled={busy} onClick={async () => {
              if (!confirm("Delete this browser's demo account, all progress and uploads?")) return;
              setBusy(true);
              try {
                await clearFiles();
                reset("start");
                signOut();
                router.replace(`/signup${next}`);
              } catch {
                setError("Unable to clear local uploads. Please try again.");
              } finally {
                setBusy(false);
              }
            }}>Reset demo account</button>
          </div>}
        </>}
      </div>
      <details className="account-demo">
        <summary>Presentation workspaces</summary>
        <DemoWorkspaces destination={destination} />
      </details>
    </section>
  );
}

function DemoWorkspaces({ destination }: { destination: string }) {
  const { data, enterDemo } = useDemo();
  const router = useRouter();
  const roles: { name: string; role: Role; href: string; text: string }[] = [
    {
      name: "Candidate",
      role: "candidate",
      href: destination,
      text: `${data.profile.name} · Applications & examinations`,
    },
    {
      name: "Administrator",
      role: "admin",
      href: "/admin",
      text: "MUSON office · Review & publish",
    },
    {
      name: "Examiner",
      role: "examiner",
      href: "/examiner",
      text: "Dr Tunde Adebayo · Practical assessment",
    },
  ];
  return (
    <>
      <div className="role-grid">
        {roles.map((item) => (
          <article className="exam-card" key={item.role}>
            <h2>{item.name}</h2>
            <p>{item.text}</p>
            <button
              className="button"
              onClick={() => {
                enterDemo(item.role);
                router.push(item.href);
              }}
            >
              Enter {item.name.toLowerCase()} demo
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
      <Notice>
        Presentation workspaces bypass login and share this browser&apos;s data. This is not secure authentication.
      </Notice>
    </>
  );
}

export function Roadmap() {
  return (
    <PublicPage
      eyebrow="FROM PRESENTATION TO PRODUCTION"
      title="The platform roadmap"
      intro="One connected foundation. A phased route to live examinations and admissions."
    >
      <div className="offerings">
        {[
          [
            "01 · NOW",
            "Working prototype",
            "Browser-local registration, theory, practical assessment, review, sample certificates, appeals and Diploma applications. Synthetic data and simulated payments.",
          ],
          [
            "02 · DECEMBER 2026",
            "Live graded examinations",
            "Authenticated APIs, server timing, a protected question bank, durable video storage, payments and reconciliation, audited marking and a public certificate registry. Launch subject to MUSON policy and security sign-off.",
          ],
          [
            "03 · 2027 INTAKE",
            "Admissions & beyond",
            "Production document handling, entrance examination delivery, audition scheduling, admission decisions and offers. Then Basic School enrolment and additional institutions.",
          ],
        ].map(([phase, title, text]) => (
          <article className="offering" key={phase}>
            <span className="eyebrow">{phase}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="two-column">
        <div>
          <h2>Decisions before launch</h2>
          <ul>
            <li>
              Confirm sitting dates, fees, grade prerequisites and pass marks.
            </li>
            <li>
              Approve rubrics, appeal policies, certificate templates and
              signatures.
            </li>
            <li>Choose a payment provider and settlement arrangement.</li>
            <li>
              Agree guardian consent, privacy, recording retention and support
              ownership.
            </li>
          </ul>
        </div>
        <div>
          <h2>Theory delivery</h2>
          <Notice tone="warning">
            Browser warnings are not secure proctoring. A funded proctoring
            solution or supervised MUSON examination rooms are required before
            live exams.
          </Notice>
          <p>
            <CheckCircle2 size={16} /> Production readiness includes
            accessibility, security, backups, recovery and load testing.
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
