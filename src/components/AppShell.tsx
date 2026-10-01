"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { asset } from "@/lib/urls";
import { clearFiles } from "@/lib/files";
import { date, type Role } from "@/lib/workflows";

const candidateLinks = [
  ["Overview", "/candidate", LayoutDashboard],
  ["My profile", "/candidate/profile", GraduationCap],
  ["Diploma application", "/candidate/application", ClipboardList],
  ["Exam registration", "/candidate/register", BookOpen],
  ["Theory exam", "/candidate/theory", FileCheck2],
  ["Video practical", "/candidate/practical", Video],
  ["Results & certificates", "/candidate/results", Award],
  ["Appeals", "/candidate/appeals", ShieldCheck],
] as const;
const adminLinks = [
  ["Overview", "/admin", LayoutDashboard],
  ["Applications", "/admin/applications", ClipboardList],
  ["Entrance scheduling", "/admin/schedule", CalendarDays],
  ["Integrity review", "/admin/integrity", ShieldCheck],
  ["Publish results", "/admin/results", FileCheck2],
  ["Certificates", "/admin/certificates", Award],
  ["Appeals", "/admin/appeals", BookOpen],
] as const;
const examinerLinks = [
  ["Grading queue", "/examiner", ClipboardList],
  ["Marking workspace", "/examiner/marking", Video],
] as const;
const roles: [Role, string][] = [
  ["visitor", "Public website"],
  ["candidate", "Candidate · Ada"],
  ["admin", "MUSON admin"],
  ["examiner", "Examiner · Dr Adebayo"],
  ["examiner-2", "Examiner · Ms Williams"],
];

export function AppShell({ children }: { children: ReactNode }) {
  const { data, hydrated, ready, run, reset, error, clearError, signedIn, signOut, enterDemo } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [controls, setControls] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState(false);
  const section = pathname.split("/")[1];
  const portal = ["candidate", "admin", "examiner"].includes(section);
  const needsLogin = section === "candidate" && !signedIn;
  const activePaper = data.registrations.some(item => item.attempt && !item.attempt.submitted);
  useEffect(() => {
    const controller = new AbortController();
    let release: (() => void) | undefined;
    if (!navigator.locks) return;
    void navigator.locks.request("muson-demo-workspace", { signal: controller.signal }, async () => {
      if (controller.signal.aborted) return;
      const held = new Promise<void>((resolve) => { release = resolve; });
      await useDemo.persist.rehydrate();
      if (!controller.signal.aborted) {
        ready();
        setActiveTab(true);
      }
      await held;
    }).catch((failure) => {
      if (!controller.signal.aborted) console.warn("Workspace lock unavailable", failure);
    });
    return () => {
      controller.abort();
      release?.();
    };
  }, [ready]);
  useEffect(() => {
    if (!hydrated || !activeTab) return;
    if (activePaper && pathname.replace(/\/$/, "") !== "/candidate/theory") {
      router.replace("/candidate/theory");
      return;
    }
    if (needsLogin) {
      router.replace(`/login?next=${encodeURIComponent(pathname + window.location.search)}`);
      return;
    }
    const role = useDemo.getState().data.role;
    if (section === "candidate" && role !== "candidate")
      run({ type: "role", role: "candidate" });
    if (section === "admin" && role !== "admin")
      run({ type: "role", role: "admin" });
    if (section === "examiner" && !role.startsWith("examiner"))
      run({ type: "role", role: "examiner" });
  }, [section, hydrated, run, needsLogin, pathname, router, activeTab, activePaper]);
  const changeRole = (role: Role) => {
    enterDemo(role);
    router.push(
      role === "visitor"
        ? "/"
        : role.startsWith("examiner")
          ? "/examiner"
          : `/${role}`,
    );
    setMenu(false);
  };
  const links =
    section === "admin"
      ? adminLinks
      : section === "examiner"
        ? examinerLinks
        : candidateLinks;
  if (!activeTab) return (
    <main className="loading" role="status">
      <h2>Opening your MUSON workspace</h2>
      <p>If MUSON is open in another tab, close that tab to continue here. Use one tab to keep your work in sync.</p>
      <small>A current browser and HTTPS or localhost are required.</small>
    </main>
  );
  const brand = (
    <Link href="/" className="brand">
      <Image
        src={asset("brand/muson.png")}
        alt="MUSON"
        width={52}
        height={52}
      />
      <span>
        MUSON<small>Music. Education. Excellence.</small>
      </span>
    </Link>
  );
  return (
    <div onClickCapture={(event) => {
      if (activePaper && (event.target as Element).closest("a")) {
        event.preventDefault();
        event.stopPropagation();
        useDemo.setState({ error: "Submit your theory paper before leaving the examination." });
      }
    }}>
      <div className="demo-bar">
        <span>
          <i /> Presentation edition{" "}
          <span className="demo-extra">/ Synthetic data only</span>
        </span>
        <button onClick={() => setControls(!controls)}>
          <Settings2 size={13} /> Demo controls
        </button>
      </div>
      {controls && (
        <div className="demo-controls">
          <label>
            View as
            <select
              aria-label="View as"
              disabled={activePaper}
              value={data.role}
              onChange={(event) => changeRole(event.target.value as Role)}
            >
              {roles.map(([value, label]) => (
                <option key={value} value={value}>
                  {value === "candidate" ? `Candidate · ${data.profile.name.split(" ")[0]}` : label}
                </option>
              ))}
            </select>
          </label>
          <span>
            Demo date: <strong>{date(data.now)}</strong>
          </span>
          <button
            className="button secondary small"
            disabled={activePaper}
            onClick={() => run({ type: "advance", days: 4 })}
          >
            Advance 4 days
            <ArrowRight size={14} />
          </button>
          <label>
            Load checkpoint
            <select
              aria-label="Load checkpoint"
              disabled={activePaper}
              value=""
              onChange={(event) => {
                const value = event.target.value as
                  "start" | "registered" | "marking" | "results" | "diploma" | "appeal";
                if (
                  value &&
                  confirm("Replace current demo progress and remove any local account with this checkpoint?")
                ) {
                  reset(value);
                  router.push(value === "diploma" ? "/admin/applications" : value === "marking" || value === "appeal" ? "/examiner" : "/candidate");
                }
              }}
            >
              <option value="">Choose a checkpoint</option>
              <option value="start">Start / empty entries</option>
              <option value="registered">Paid entries</option>
              <option value="marking">Submitted assessments</option>
              <option value="results">Results & certificates</option>
              <option value="diploma">Diploma / submitted application</option>
              <option value="appeal">Appeal / independent review</option>
            </select>
          </label>
          <button
            className="icon-button"
            title="Reset all demo data"
            aria-label="Reset all demo data"
            disabled={activePaper}
            onClick={() => {
              if (confirm("Reset all demo progress, local account and uploads?")) {
                reset("start");
                signOut();
                void clearFiles();
                router.push("/");
              }
            }}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )}
      {!portal ? (
        <header className="public-nav">
          {brand}
          <button
            className="icon-button mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <nav className={menu ? "open" : ""} onClick={() => setMenu(false)}>
            <Link href="/diploma">Diploma School</Link>
            <Link href="/graded-exams">Graded Exams</Link>
            <Link href="/basic-school">Basic School</Link>
            <Link href="/about">About MUSON</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/verify">Check a certificate</Link>
            <Link className="button small" href={signedIn ? "/candidate" : "/login"}>
              {signedIn ? "My portal" : "Log in"}
              <ArrowUpRightIcon />
            </Link>
            {!signedIn && <Link href="/signup">Sign up</Link>}
          </nav>
        </header>
      ) : (
        <div className="portal-top">
          {brand}
          <span className="portal-label">
            {section === "candidate"
              ? "Student portal"
              : section === "admin"
                ? "Administration"
                : "Examiner portal"}
          </span>
          <div className="top-actions">
            {signedIn && <button className="icon-button" title="Log out" aria-label="Log out" disabled={activePaper} onClick={() => {
              signOut();
              setNotifications(false);
              setMenu(false);
              setControls(false);
              router.replace("/login");
            }}><LogOut size={20} /></button>}
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              <Menu />
            </button>
            <button
              className="icon-button"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={20} />
              <i className="notification-dot" />
            </button>
            <span className="avatar">
              {section === "candidate"
                ? data.profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
                : section === "admin"
                  ? "MA"
                  : data.role === "examiner-2"
                    ? "SW"
                    : "TA"}
            </span>
          </div>
        </div>
      )}
      {notifications && (
        <aside className="notification-panel">
          <div className="section-title">
            <h2>Notifications</h2>
            <button
              className="icon-button"
              aria-label="Close notifications"
              onClick={() => setNotifications(false)}
            >
              <X size={18} />
            </button>
          </div>
          {data.notifications.map((item) => (
            <div key={item.id}>
              <p>{item.text}</p>
              <small>{date(item.createdAt)}</small>
            </div>
          ))}
        </aside>
      )}
      <div className={portal ? "portal-layout" : "public-layout"}>
        {portal && (
          <aside className={`sidebar ${menu ? "open" : ""}`}>
            <div className="sidebar-heading">WORKSPACE</div>
            <nav>
              {links.map(([label, href, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    pathname.replace(/\/$/, "") === href ? "active" : ""
                  }
                  onClick={() => setMenu(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="sitting-note">
              <span className="eyebrow">CURRENT SITTING</span>
              <strong>December 2026</strong>
              <small>All dates & fees are illustrative</small>
            </div>
            <Link className="back-site" href="/">
              <ArrowLeft size={16} />
              Back to MUSON
            </Link>
          </aside>
        )}
        <main className={portal ? "workspace" : ""}>
          {hydrated && !needsLogin ? (
            children
          ) : (
            <div className="loading" role="status">
              Opening MUSON...
            </div>
          )}
        </main>
      </div>
      {!portal && (
        <footer className="footer">
          <div>
            {brand}
            <p>
              The Musical Society of Nigeria.
              <br />
              Nurturing musicians. Inspiring generations.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            <Link href="/diploma">Diploma School</Link>
            <Link href="/basic-school">Basic School</Link>
            <Link href="/graded-exams">Graded Examinations</Link>
          </div>
          <div>
            <strong>Connect</strong>
            <Link href="/contact">Visit & contact us</Link>
            <Link href="/verify">Certificate verification</Link>
            <Link href="/roadmap">Platform roadmap</Link>
          </div>
          <small>
            © 2026 MUSON · Presentation prototype. No real applications or
            payments are processed.
          </small>
        </footer>
      )}
      {error && (
        <div role="alert" className="error-toast">
          <span>{error}</span>
          <button
            className="icon-button"
            aria-label="Dismiss error"
            onClick={clearError}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={16} />;
}
