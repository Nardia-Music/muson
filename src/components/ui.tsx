"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { money } from "@/lib/workflows";

export function MockCheckout({ open, amount, onComplete, onClose }: { open: boolean; amount: number; onComplete: () => void; onClose: () => void }) {
  const [declined, setDeclined] = useState(false);
  return <ConfirmDialog open={open} title="MUSON test checkout" confirmLabel="Complete test payment" onConfirm={onComplete} onClose={onClose}>
    <Badge>TEST MODE</Badge>
    <div className="total-row"><span>Amount</span><strong>{money(amount)}</strong></div>
    <p>Test card ending 4081</p>
    <Notice>Paystack-style simulation. No payment service is connected and no money will be charged.</Notice>
    {declined && <Notice tone="warning">Test payment declined. Nothing has been charged. Retry or cancel.</Notice>}
    <button type="button" className="text-link" onClick={() => setDeclined(true)}>Simulate declined payment</button>
  </ConfirmDialog>;
}

export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onClose }: { open: boolean; title: string; children: ReactNode; confirmLabel: string; onConfirm: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  return <dialog ref={dialog} className="confirm-dialog" aria-labelledby={heading} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <h2 id={heading}>{title}</h2>
    <div className="space-top">{children}</div>
    <div className="form-actions"><button className="button secondary" onClick={onClose}>Cancel</button><button className="button" onClick={onConfirm}>{confirmLabel}</button></div>
  </dialog>;
}

export function Heading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </header>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const value = String(children).toLowerCase();
  const tone =
    /valid|paid|cleared|verified|published|resolved|scheduled|shortlisted/.test(
      value,
    )
      ? "good"
      : /rejected|cancelled|superseded|absent|referred/.test(value)
        ? "bad"
        : "waiting";
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Empty({
  title,
  children,
  href,
  label,
}: {
  title: string;
  children: ReactNode;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
      {href && (
        <Link className="button" href={href}>
          {label}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning";
}) {
  return <div className={`notice ${tone}`}>{children}</div>;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
export function Go({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
export function Steps({
  labels,
  current,
}: {
  labels: string[];
  current: number;
}) {
  return (
    <ol className="steps">
      {labels.map((label, index) => (
        <li key={label} className={index <= current ? "active" : ""}>
          <span>{index < current ? <Check size={13} /> : index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
