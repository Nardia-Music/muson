# Friday Presentation Runbook

Presentation: Friday, 2 October 2026. Local rehearsal: http://localhost:4173. Business clock starts at 3 December 2026; exam timing uses real elapsed time.

## Before presenting

1. Run the production build and `npm run preview`. Use one browser tab with storage enabled.
2. Open Demo controls and reset. Select **Candidate · Ada**, then use the MUSON brand link to return to the public website while keeping the demo session open.
3. Check audio output and fullscreen permission. Keep the static `out` build available as the local fallback.
4. Rehearse this sequence twice on the presentation machine. The automated checks are not a substitute for a timed human rehearsal.
5. Confirm the deployed build at https://nardia-music.github.io/muson/ and scan both the public sample QR and a newly issued certificate from a phone. The latest local changes are not deployed until committed and pushed. Physical-phone scanning remains a presenter check.
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
| 0:45 | Apply; review subject grades; attach four samples; Continue; Pay mock fee & submit; Complete test payment | Prefilled application and explicitly simulated checkout |
| 1:20 | Demo controls: MUSON admin; Applications; Review Ada | Seven applicants with mixed statuses; verify Ada's documents, shortlist, create a slot and assign Ada |
| 2:00 | Candidate; Exam registration | Add Grade 5 Theory and Piano Practical, then complete test checkout |
| 2:45 | Theory exam | Optionally enable live camera preview; confirm checks; begin; show shuffled Grade 5 questions and engraved alto clef |
| 4:30 | Finish paper or submit early | Provisional score; unanswered questions count as zero |
| 5:00 | Video practical | Fixed code MUSON-ADA-2026, live countdown, WAT deadline, preview, declaration and single submission |
| 5:45 | Examiner: Dr Adebayo; open Ada's performance | Enter 23, 22, 23, 8; add comments; submit mark (76%) |
| 6:30 | Admin: Integrity review | Clear Ada with a note; leave Kehinde flagged to demonstrate a held result |
| 7:00 | Publish results; confirm in the application dialog | Only eligible entries publish; ungraded/flagged entries remain held |
| 7:30 | Certificates | Try issuing before eligibility; advance 4 days; issue passing certificates |
| 8:15 | Candidate: Results & certificates | PDF crest, sample signatures and classification; QR shares an explicitly unsigned snapshot |
| 9:00 | Candidate: Appeals | Submit reason; switch to Ms Williams; enter 25, 25, 24, 8 and comments (82%) |
| 10:00 | Admin: Appeals | Approve; original score is retained and prior practical certificate is superseded |
| 10:45 | Public roadmap | Production exam delivery first, then admissions; policy and proctoring decisions |

For a passing theory certificate, answer at least 6 of 12 questions correctly. All question content is illustrative. A shorter spoken demo can submit early and show the public sample certificate, or load the Results checkpoint afterwards. Loading checkpoints **replaces**, rather than merges, current progress and removes any local account.

## Theory answer card

Print this card or use another device. Switching tabs on the presenting browser records an integrity event. Question and answer order are shuffled; match by topic, not position. These original questions need academic review and are not an official MUSON paper. The 12-minute timer is a presentation format, not the official Grade 5 examination duration.

| Topic / prompt cue | Correct answer |
| --- | --- |
| Alto-clef interval, E to C | Minor sixth |
| Heard interval inverted | Perfect fourth |
| Minor key with five sharps | G-sharp minor |
| G melodic minor descending | G, F, E-flat, D, C, B-flat, A, G |
| Complete the 9/8 bar | Crotchet rest |
| Poco rallentando e diminuendo | Gradually a little slower and softer |
| C-major chord, E in bass | Tonic triad in first inversion |
| Dominant seventh in B minor | F-sharp, A-sharp, C-sharp, E |
| B-flat clarinet, written F-sharp | E |
| A minor: E major to F major | Interrupted cadence |
| D major up a perfect fifth | A major: three sharps |
| Leading note of E harmonic minor | D-sharp |

## Recovery checkpoints

- **Start / empty entries:** Ada profile and draft Diploma form, with background review examples.
- **Paid entries:** paid Ada theory and practical registrations, no assessment started.
- **Submitted assessments:** Ada theory completed at 100%, practical submitted, examiner selected.
- **Results & certificates:** marked/cleared/published results and two issued Ada samples; practical mark 76%.
- **Diploma / submitted application:** Ada's paid application with four sample documents, plus six background applicants; administrator selected.
- **Appeal / independent review:** published results and certificates, practical appeal already submitted within seven days; Ms Williams selected for the second mark.

Use the checkpoint selector only when abandoning the current rehearsal. Reset asks for confirmation and clears uploaded blobs. Refresh preserves saved drafts, answers, submitted files and marks. The theory deadline does not restart on refresh. In-app navigation, logout, role changes, checkpoint loading and clock advancement are blocked during an active paper; closing or reloading the page requests a browser warning when supported. Submit the paper before switching workspaces.

Advance **once** by four days to issue certificates, then submit the appeal. Advancing twice moves beyond the seven-day appeal deadline. Recover with the Appeal checkpoint if needed. Clear Ada's integrity session with a review note before publication; the three Kehinde frames are labeled illustrations, not captured evidence.

For document replacement, **Request replacement** immediately changes the application to **needs info**. Return as Ada and choose **Replace requested documents**, upload a replacement or use a sample, then continue and resubmit. The already-paid application is not charged again.

## Presenter cautions

- One tab owns the workspace through a Web Lock. Other tabs wait; close them before reloading the presenting tab. A waiting tab loads the latest saved state after ownership transfers. This requires a current browser on HTTPS or localhost. There is no cross-device state sync.
- The optional camera preview requests permission and stops all tracks when disabled or when leaving readiness. No camera frames, recordings or identity documents are saved by this check. Permission denial does not block the demo. Unsupported fullscreen can continue in supervised demo mode.
- The bundled performance is a piano still with tones, not a genuine assessed performance. A fictional MP4/WebM/MOV up to 50 MB can be selected instead. MOV playback depends on its codec/browser.
- Document limit is 5 MB. Save a draft after choosing files. Don't upload actual personal records.
- Sample fees, dates, rubrics, pass mark, classification thresholds (Pass 50, Merit 65, Distinction 80), seven-day appeal window and four-day certificate delay require MUSON approval.
- `MUSON-DEMO-2026` is a fixed Grade 4 theory sample from May, distinct from Ada's December Grade 5 entry. Newly issued QRs carry validated but **unsigned** sample details for another device. They cannot authenticate a qualification or reflect later cancellation/appeal changes. The issuing browser prioritizes its current local record. A localhost URL still cannot be opened from another phone.
- Contact submission never sends email. No payment provider, backend or official signature is involved.

## Recording and content approvals

Supply a consented 45-60 second phone recording before the presentation. Introduce the fictional candidate Ada Okafor, Grade 5 Piano, code **MUSON-ADA-2026**, and piece names; keep the face, hands and keyboard visible in one continuous take. Use approved music/excerpts. Select it through **Performance video**. The bundled eight-second still-and-tones clip remains honestly labeled and has not been replaced by a genuine human performance.

MUSON's [official examination page](https://muson.org/muson-graded-examinations/) lists November 2026 and a May schedule; December here is a rehearsal calendar. The public About page uses [MUSON's history](https://muson.org/about-us/) and [trustee directory](https://muson.org/board-of-trustees/). Confirm the current patron and management roster, institutional assets, signatories, dates and academic content before presenting them as official.

## Validation record

Completed: lint, TypeScript, production static build, **24 unit tests** and **16 desktop/mobile Chromium tests**. Browser coverage includes the connected exam-to-appeal cycle, fresh-browser certificate snapshots, camera permission denial and track cleanup using a synthetic stream, checkout cancellation, one-action Diploma replacement, file persistence, active-paper navigation protection, timer reload/expiry, route titles and responsive layouts. Automated camera checks do not certify a physical webcam.

Outstanding external checks: deploy this revision, scan QRs from a physical phone, test the actual webcam, supply the human performance recording, obtain MUSON policy/assets approval, and complete two timed rehearsals. Mobile validation is Chromium emulation, not Safari or physical-device certification.