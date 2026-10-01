# MUSON Presentation Prototype

A separate Next.js / TypeScript repository for the Friday, 2 October 2026 presentation. The adjacent Nardia landing site is unchanged. All records, payments, assessments and certificates are demonstrative, not official MUSON transactions.

## Run locally

Node 22.18+ and npm are required. From this directory:

```sh
npm ci
npm run build
npm run preview
```

Open http://localhost:4173. For editing with hot reload use `npm run dev` (http://localhost:3000). The presentation preview serves the actual static export, not a development server. It must be served over HTTP; opening HTML files directly is unsupported.

Use **Demo controls** to switch between Ada, the administrator, Dr Adebayo and Ms Williams; load checkpoints; advance the illustrative business date; or reset. State stays in this browser across refreshes.

- [Presentation runbook](docs/demo-runbook.md)
- [Build plan and production roadmap](docs/build-plan.md)

## Included

- Public programme pages, contact acknowledgement, role chooser and certificate lookup.
- Candidate sign-up, login, logout, saved browser-local sessions, return-to-application navigation and local account reset.
- Seven seeded Diploma applicants, subject-level O'Level grades, local documents, one-action replacement requests, verification, shortlisting and capacity-aware scheduling.
- Cancellable test checkout, shuffled Grade 5 theory with VexFlow notation/audio, optional live camera preview, active-paper navigation guards and provisional scoring.
- A single practical video submission, fixed rehearsal code, declaration, live countdown and WAT deadline.
- Examiner drafts and rubric marking; integrity clearance/referral; eligible-result publication.
- Branded sample PDFs with illustrative signatures, classifications and portable snapshot QRs; local cancellation, independent appeals and superseded-certificate history.
- Diploma and appeal checkpoints, an answer card, and sourced public programme information with clearly illustrative rehearsal dates.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=2
```

Validated on macOS / Node 22: **24 unit tests and 16 Chromium browser tests**, plus lint, TypeScript and the production build. Viewports are 1440px desktop and 390px mobile, plus intermediate public-layout widths. Browser checks cover accounts, the connected exam cycle, PDF download, fresh-browser snapshots, appeals/revocation, navigation guards, timer reload/expiry, camera lifecycle with synthetic streams, cancelled checkout, actual IndexedDB uploads, Diploma replacement/scheduling, page titles and layout/assets. Screenshots and failure traces are generated under ignored `test-results/`.

Chromium needs permission to launch normal macOS processes. In the VS Code terminal sandbox, use an approved unsandboxed browser-test run; dependency downloads can use `PLAYWRIGHT_BROWSERS_PATH` in a writable temporary directory.

## Static hosting

GitHub Pages deployment is configured in `.github/workflows/nextjs.yml` for the standalone MUSON repository.

### Cloudflare Pages (alternative)

Connect the standalone MUSON repository using the **Next.js Static HTML Export** preset. Build command: `npm run build`. Output directory: `out`. Set Node to 22. Leave `NEXT_PUBLIC_BASE_PATH` empty and set `NEXT_PUBLIC_SITE_ORIGIN` to the final HTTPS origin, for example `https://your-project.pages.dev`. No Workers, backend or OpenNext adapter is required.

### GitHub Pages

In the repository's **Settings > Pages**, select **GitHub Actions** as the build and deployment source. Pushes to `main` deploy automatically; the workflow can also be run manually from the **Actions** tab.

The workflow uses Node 22 and `npm ci`, builds the static export, and publishes `out`. It obtains `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_ORIGIN` from the Pages configuration so links, assets and certificate QR URLs share the deployed address, including custom domains. Only the deployment job has Pages write and OIDC permissions.

To reproduce a project-site build locally:

```sh
NEXT_PUBLIC_BASE_PATH=/muson NEXT_PUBLIC_SITE_ORIGIN=https://nardia-music.github.io npm run build
```

The artifact contains the **contents of `out`**; don't add another `muson` directory inside it. A custom-domain/root site uses an empty base path. Actions publishes the artifact directly without a Jekyll build.

Both settings are public build-time values, never secrets. Changing them requires rebuilding. To return to local root hosting: `NEXT_PUBLIC_BASE_PATH= NEXT_PUBLIC_SITE_ORIGIN= npm run build`.

After hosting, directly open `/candidate/theory/` and `/verify/?number=MUSON-DEMO-2026` (with the project prefix if used), reload them, play the sample media, download a PDF and scan the sample QR from a phone.

## Data and limitations

### Demo accounts

Open `/signup/` to create one fictional candidate account in this browser. Choose a throwaway password of at least eight characters. Signing up starts a fresh candidate journey and fills the profile name/email; complete the remaining profile fields in **My profile**. This is a single-candidate demo, not a multi-user account system.

Candidate deep links redirect to `/login/` when signed out and resume their original destination after login or sign-up. Sessions survive refresh; **Log out** ends the session without deleting saved progress. Login uses the email supplied at sign-up, even if the contact email is later edited in the profile.

**Forgot password? > Reset demo account** asks for confirmation, clears the account, progress and uploaded files, and opens sign-up again. It does not send an email. Loading a checkpoint also removes the local account and resumes a seeded demonstration session. The full demo reset clears the account and signs out.

The **Presentation workspaces** chooser on the account screens and **Demo controls** deliberately bypass login. Candidate, administrator and examiner views still share the same local dataset. Only a salted PBKDF2 password verifier is persisted, never the entered password, but browser storage and route guards provide no production security. Do not use real passwords or personal details. There is no server authentication, email verification or cross-device account recovery.

Zustand metadata uses localStorage key `muson-demo-v1`; selected files use the dedicated `muson-demo-files` IndexedDB database. Reset clears this demo's uploads. Use only synthetic files; this is not a secure storage, identity or retention system. A Web Lock allows one active tab; additional tabs wait and rehydrate when ownership transfers. Close waiting tabs before reloading the presenting tab. HTTPS or localhost and a current browser with Web Locks are required. Private browsing/storage restrictions may prevent persistence; bundled media remains available. Load a checkpoint to pick up revised seeds after an update.

Role switching is not authentication. Answer keys and workflow logic are public client code. ID checks and saved evidence frames are simulated. The optional live webcam preview saves nothing and stops tracks on exit. Fullscreen and tab warnings cannot secure an examination. Real money, email, video processing, authoritative timing, official signatures and tenant isolation are intentionally absent.

`MUSON-DEMO-2026` is an immutable Grade 4 public sample. Newly issued QRs include an unsigned sample snapshot so details can be viewed on another device after hosting. This is not authenticated verification or a live registry: cancellations and appeal changes do not synchronize. The issuing browser uses its current local record instead of the snapshot. A QR containing `localhost` cannot work on a phone. Standard PDF fonts cover the demonstration names; wider-script names need embedded Unicode fonts before production.

## Source layout

- `src/lib/workflows.ts`: typed records, MUSON configuration, transition guards, seeds and checkpoints.
- `src/lib/store.ts`, `files.ts`: localStorage and IndexedDB adapters.
- `src/features/`: candidate, staff, admissions and public views.
- `src/components/`: shared shell, primitives and screen routing.
- `src/app/[...slug]/page.tsx`: fixed exportable routes, IDs supplied through query strings.
- `e2e/`: independent browser journeys with fresh browser data per test.

## Assets

Fonts: locally bundled Noto Sans and Tinos, echoing Nardia typography. Icons: Lucide. The logo and gala photograph are sourced from MUSON's public site for this internal presentation; confirm publication rights before public launch:

- Logo: https://muson.org/wp-content/uploads/2021/03/1519863257588-removebg-preview.png
- Gala photo: https://muson.org/wp-content/uploads/2021/03/Marquess-Studios-at-GALA-Night-476-Copy-min-1536x1024.jpg
- Piano photo: copied from the adjacent Nardia landing project's `images/figma/hero-piano.jpg`; confirm original licensing before publication.

The eight-second video is an illustrative piano still with generated interval tones, **not an actual candidate performance**. Supply a consented 45-60 second human recording for rehearsal; the runbook includes the fixed code and recording brief. The listening exercise is a generated C-to-G perfect fifth; the question asks for its inversion. Alto-clef notation is engraved with VexFlow. Regenerate bundled binary samples with `node scripts/generate-demo-assets.mjs` when ffmpeg is installed. Bundled assets are already present, so ffmpeg is not needed to run or host the app.
