# Friday Presentation Runbook

Presentation: Friday, 2 October 2026. Local rehearsal: http://localhost:4173. Business clock starts at 3 December 2026; exam timing uses real elapsed time.

## Before presenting

1. Run the production build and `npm run preview`. Use one browser tab with storage enabled.
2. Open Demo controls and reset. Select **Candidate · Ada**, then use the MUSON brand link to return to the public website while keeping the demo session open.
3. Check audio output and fullscreen permission. Keep the static `out` build available as the local fallback.
4. Rehearse this sequence twice on the presentation machine. The automated checks are not a substitute for a timed human rehearsal.
5. After selecting a host, confirm its HTTPS URL and scan the public sample QR from a phone. Neither a hosted deployment nor a physical-phone test has been performed yet.
6. Freeze changes two hours before the presentation. Avoid clearing browser storage mid-demo.

## Optional account tour

1. Reset the demo, then choose **Log in** on the public navigation. Alternatively, follow **Apply** while signed out to show the login gate.
2. Choose **Create an account**. Enter a fictional name, an `example.test` email, and a throwaway password of at least eight characters. Confirm the password and acknowledge the demo notice.
3. Submit to continue to the student portal or the application that initiated the flow. Open **My profile** to show the prefilled name/email and complete the fictional phone number and birth date.
4. Use **Log out** in the portal header, then log in with the same credentials. Show that the saved profile and progress remain after a refresh.
5. **Forgot password?** offers an explicitly local reset, not an email. Confirming deletes the account, progress and uploads. Cancel to keep the account unchanged.
6. Before the seeded sequence below, load **Start / empty entries** in Demo controls. This removes the local account and restores Ada's demonstration session.

The account screens also retain **Presentation workspaces** for direct candidate, administrator and examiner access. These shortcuts deliberately bypass login; this is a browser-local demonstration, not secure authentication.

## Twelve-minute sequence

| Time | Action | What to show |
| --- | --- | --- |
| 0:00 | Public Home, then Diploma School | MUSON branding, programmes, requirements and Apply |
| 0:45 | Apply; Continue twice; attach four samples; Continue; Pay mock fee & submit | One prefilled application with real browser-local state |
| 1:20 | Demo controls: MUSON admin; Applications; Review | Verify each document, shortlist, then create entrance slot and assign Ada |
| 2:00 | Candidate; Exam registration | Add Grade 5 Theory and Piano Practical, then mock payment |
| 2:45 | Theory exam | Confirm mock checks; begin; show shuffled questions, notation/audio, and tab/fullscreen warnings |
| 4:30 | Finish paper or submit early | Provisional score; unanswered questions count as zero |
| 5:00 | Video practical | Persistent spoken code, window, guidelines, sample preview, declaration and single submission |
| 5:45 | Examiner: Dr Adebayo; open Ada's performance | Enter 23, 22, 23, 8; add comments; submit mark (76%) |
| 6:30 | Admin: Integrity review | Clear Ada with a note; leave Kehinde flagged to demonstrate a held result |
| 7:00 | Publish results | Only eligible entries publish; ungraded/flagged entries remain held |
| 7:30 | Certificates | Try issuing before eligibility; advance 4 days; issue passing certificates |
| 8:15 | Candidate: Results & certificates | Download sample PDF; follow its local verification link; show public sample QR separately |
| 9:00 | Candidate: Appeals | Submit reason; switch to Ms Williams; enter 25, 25, 24, 8 and comments (82%) |
| 10:00 | Admin: Appeals | Approve; original score is retained and prior practical certificate is superseded |
| 10:45 | Public roadmap | Production exam delivery first, then admissions; policy and proctoring decisions |

For a passing theory certificate, answer at least 6 of 12 questions correctly. All question content is illustrative. A shorter spoken demo can submit early and show the public sample certificate, or load the Results checkpoint afterwards. Loading checkpoints **replaces**, rather than merges, current progress and removes any local account.

## Recovery checkpoints

- **Start / empty entries:** Ada profile and draft Diploma form, with background review examples.
- **Paid entries:** paid Ada theory and practical registrations, no assessment started.
- **Submitted assessments:** Ada theory completed at 100%, practical submitted, examiner selected.
- **Results & certificates:** marked/cleared/published results and two issued Ada samples; practical mark 76%.

Use the checkpoint selector only when abandoning the current rehearsal. Reset asks for confirmation and clears uploaded blobs. Refresh preserves saved drafts, answers, submitted files and marks. The theory deadline does not restart on refresh. Advancing the business date is blocked during an active theory attempt.

## Presenter cautions

- State does not sync between tabs/devices. Use the role selector on the presenting browser.
- Mock ID and webcam checks are explicit simulations. No camera or ID is captured. Unsupported fullscreen can continue in supervised demo mode.
- The bundled performance is a piano still with tones, not a genuine assessed performance. A fictional MP4/WebM/MOV up to 50 MB can be selected instead. MOV playback depends on its codec/browser.
- Document limit is 5 MB. Save a draft after choosing files. Don't upload actual personal records.
- Sample fees, dates, rubrics, pass mark, 7-day appeal window and four-day certificate delay require MUSON approval.
- Cross-device verification uses only `MUSON-DEMO-2026`; live local issuance/revocation is not a public registry. A downloaded PDF remains a snapshot; lookup shows the current local status.
- Contact submission never sends email. No payment provider, backend or official signature is involved.

## Validation record

Completed: production static build, lint, TypeScript, 20 domain/PDF/account checks and 12 desktop/mobile Chromium checks. These include sign-up validation, login/logout and saved profiles, return destinations, local account reset, a fresh-data connected exam-to-appeal cycle, Diploma replacement/scheduling, real file persistence, timer reload/expiry and public layout/assets.

Outstanding external checks: final host/remote selection, public deployment, physical-phone QR scan, MUSON policy/assets approval and the presenter's two timed rehearsals. Mobile validation is Chromium emulation, not a Safari or physical-device certification.