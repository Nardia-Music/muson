# MUSON Build Plan

Based on MUSON Platform Product Spec v0.1. Prepared for the 2 October 2026 presentation. The prototype is an independent Next.js/TypeScript repository beside, not inside, the Nardia landing project.

## Friday scope: implemented

| Phase | Delivered | Verification |
| --- | --- | --- |
| Foundation | Static export; MUSON shell; bundled fonts/assets; shared typed state; role/date/reset/checkpoint controls | Build, lint, TypeScript and URL tests |
| Candidate exams | Registration/payment; profile; timed shuffled theory with notation/audio; single video submission and declaration | Lifecycle guards and browser exam flow |
| Staff processing | Assigned marking/drafts; integrity clear/refer; eligible publication and held entries | Browser exam flow and negative domain cases |
| Qualifications | Delayed PDF/QR issuance; local verification/cancellation; public sample; independent appeals and supersession | PDF parsing and connected two-examiner browser flow |
| Diploma | Prefilled steps; file uploads; mock fee; verification/replacement; shortlist/reject; slot capacity and candidate schedule | Resubmission/scheduling browser flow and domain checks |
| Public/handoff | Home, Diploma, Exams, Basic, About, Contact, role entry, Verify, roadmap and rehearsal guide | Public deep links and desktop/mobile layout checks |

The implementation consolidates screens into four feature modules rather than one implementation file per route. Domain transitions own workflow decisions; storage and views remain separate. Public query-string IDs work with a fixed route list and static export. No real backend or tenant security is implied by institution IDs.

## Remaining presentation steps

1. Choose the remote owner and Cloudflare Pages or GitHub Pages. Create/push/deploy only with authorization and host access.
2. Build with the final public origin and appropriate base path. Verify hosted deep links, media, download and a physical phone's sample QR scan.
3. Run two timed human rehearsals using the runbook, then freeze two hours before the presentation.

These are release activities, not missing backend features to implement for Friday.

## Production roadmap

### 1. Policy and delivery decisions

Confirm May/December sitting dates (resolve any November/December discrepancy), approved question ownership, grades/prerequisites, fees/pass marks/rubrics, practical exceptions, appeal window/fee/second marker, certificate templates/signatures and legacy verification. Set privacy, guardian consent, recording retention/deletion and support ownership. Approve branding/photo use and the final domain.

Choose funded proctoring integration/build or supervised MUSON examination rooms before committing to live online theory. The prototype is not secure proctoring.

### 2. Live graded examinations

Replace browser adapters with authenticated APIs and tenant-scoped persistence. Add actual identities/roles, examiner assignment, protected question bank/editor, authoritative server deadlines, immutable audit, durable validated/resumable uploads, retention and recovery. Integrate payments with verified webhooks, reconciliation and agreed settlement splits. Add server-side publication, certificate generation, public registry/revocation, appeals, notifications, support/reporting and exports.

Launch gates: policy approval, access-control/security review, accessibility, load/recovery tests, backup/restore rehearsal and operational ownership. The client-side answer keys and role checks must not be reused as production security.

### 3. 2027 admissions

Production application/document handling; reusable written-theory delivery; auditions and scheduling; aural assessment; admissions decisions, offer letters and staff-managed key dates. Confirm legacy imports separately.

### 4. Later expansion

Basic School enrolment, events/facilities, membership/news and additional institutions with platform administration/billing. Keep institution configuration explicit but avoid claiming the demo already provides a multi-tenant platform.

## Intentional prototype limits

No authentication, backend, real settlement, email/SMS, recording/AI proctoring, guardian portal, official signatures, cross-device live registry, tenant isolation, CMS, admissions offers or production compliance. Certificates and documents are sample-only. The static public certificate is a separate immutable fixture; it cannot reflect browser-local cancellation.