# Changelog

All changes to EyEagle v2 are documented here. Newest entries first.

---

## [2026-02-27] — Add Resubmit button to submitted audit cards

**Agent:** Finn_{UI} / Hermes_{Submission}

**Files changed:**
- src/screens/AuditListScreen/AuditListScreen.jsx
- src/screens/AuditListScreen/AuditListScreen.css

**What changed:**
Added a ↺ Resend button to each submitted audit card in AuditListScreen. Tapping it re-POSTs the full audit (metadata + base64 photos) to the Apps Script Web App via `submitToSheets`, then reopens WhatsApp with the pre-filled summary message. While the upload is in flight the button shows `…` and is disabled to prevent double-sends. Failure is non-blocking — a console warning is logged but the WhatsApp step still runs. All photo/annotation/area/comment metadata is derived from the stored audit object so no AuditContext load is required.

---

## [2026-02-27] — Remove email; replace with Google Sheets + Drive submission

**Agent:** Rex_{Architect}

**Files changed:**
- src/services/sheetsService.js (created)
- src/screens/ReviewScreen/ReviewScreen.jsx
- .env

**What changed:**
Removed EmailJS email submission entirely — it required third-party credentials, added a 200/month send cap, and sent no photos. Replaced with a Google Apps Script Web App as a free serverless backend. On submit, the app POSTs the full audit (metadata + base64 photos) to the Apps Script URL. The script appends a row to a Google Sheet (submitted time, date, technician, client, bathroom type, areas, photo count, annotation count, comments, Drive folder link, audit ID) and saves each photo as a JPEG into a per-audit Drive subfolder named `Audit – {client} – {date}`. Upload is non-blocking on failure — if the POST fails (offline, misconfigured URL), the app still completes the WhatsApp step and shows the success screen; a console warning is logged. Added `REACT_APP_APPS_SCRIPT_URL` to `.env`. Removed all `REACT_APP_EMAILJS_*` vars from `.env`. Updated the submit explainer text to reflect Sheets + Drive instead of email.

---

## [2026-02-26] — Vera QA pass — fix touch target violations

**Agent:** Vera_{QA} / Finn_{UI}

**Files changed:**
- src/components/PhotoCard/PhotoCard.css
- src/screens/AnnotateScreen/AnnotateScreen.css

**What changed:**
Full 17-item QA pass run against all screens and components. Two touch target violations found and fixed. PhotoCard Edit/Delete pill buttons were 34px tall — 14px below the 48px minimum required for mobile touch targets. AnnotateScreen Circle/Draw tool buttons were 40px. Both updated to `min-height: var(--touch-min)` (48px). All 17 checklist items passed after fixes. Core functionality (state logic, canvas tools, submission flow, undo, reset, error handling) verified correct.

---

## [2026-02-26] — Build shared Header component

**Agent:** Finn_{UI}

**Files changed:**
- src/components/Header/Header.jsx (created)
- src/components/Header/Header.css (created)
- src/screens/HomeScreen/HomeScreen.jsx
- src/screens/HomeScreen/HomeScreen.css
- src/screens/ReviewScreen/ReviewScreen.jsx
- src/screens/ReviewScreen/ReviewScreen.css

**What changed:**
Built the Header component that had been reserved as an empty directory since project setup. Component supports two modes: logo-only (no `onBack` prop) for HomeScreen, and back button + title (with `onBack` and `title` props) for inner screens. Replaced the inline `<header>` block in HomeScreen with `<Header />` and in ReviewScreen with `<Header title="Review & Submit" onBack={onBack} backLabel="‹ Back to Edit" />`. Removed now-redundant `.home-header`, `.home-logo`, `.review-header`, and `.review-title` CSS rules from both screen stylesheets. AreaScreen and AnnotateScreen retain their own custom headers as they contain screen-specific content (area label + hint, canvas toolbar).

---

## [2026-02-26] — Fix ESLint compile error on startup

**Agent:** Finn_{UI}

**Files changed:**
- package.json
- src/screens/AnnotateScreen/AnnotateScreen.jsx

**What changed:**
App failed to compile on first run due to an ESLint error: the `react-hooks/exhaustive-deps` rule was referenced in an `eslint-disable-line` comment in AnnotateScreen.jsx but the plugin wasn't loaded. Root cause was a missing `eslintConfig` field in package.json — standard Create React App projects require `"eslintConfig": {"extends": ["react-app", "react-app/jest"]}` to load the react-hooks plugin. Added the field to package.json and changed the disable comment on line 90 of AnnotateScreen.jsx from `// eslint-disable-line react-hooks/exhaustive-deps` to `// eslint-disable-line` to avoid referencing a named rule before the plugin resolves on first load.

---

## [2026-02-26] — Integrate useCamera hook into AreaScreen

**Agent:** Sketch_{Canvas}

**Files changed:**
- src/screens/AreaScreen/AreaScreen.jsx

**What changed:**
AreaScreen was using a raw FileReader to read camera captures directly into context without any compression. This meant full-size camera images (potentially 5–10MB) were being stored as base64 in React state, which could cause memory issues on phones with multiple photos per audit. Replaced the inline ref + FileReader approach with the existing `useCamera` hook, which runs `compressImage()` (max 1200px, quality 0.82) before storing. Handles cancel gracefully.

---

## [2026-02-26] — Update area list to match PRD

**Agent:** Rex_{Architect}

**Files changed:**
- src/data/areas.js

**What changed:**
The previous area list diverged from the PRD. Required areas 6 and 7 were "Walls" and "Grab Bars" — the PRD defines these as "Overall — Lit" and "Overall — Dark" (baseline spatial shots of the room with lights on and off). Optional areas were also misaligned: Mirror, Accessories, Ventilation, and Storage replaced with Walls & Corners, Drainage, Door, and Other per the PRD. Labels, IDs, icons, and hints updated across all 13 areas to match PRD definitions exactly.

---

## [2026-02-26] — Fix EyEagle branding (IGEL → EyEagle)

**Agent:** Ellis_{Docs}

**Files changed:**
- README.md
- AGENTS.md

**What changed:**
Three instances of "IGEL technicians" were found in README.md and AGENTS.md. IGEL is not the brand name — EyEagle is. Replaced all three occurrences with "EyEagle technicians".
