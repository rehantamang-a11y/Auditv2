# EyEagle v2

Mobile-first bathroom safety assessment app for EyEagle technicians.

## What changed from v1

v1 was a structured form checklist (select fields, radio buttons, condition ratings).
v2 flips the model — technicians tap a spatial area grid, shoot photos, annotate directly on the image, and submit. No forms.

## Stack

- React 19 (Create React App)
- HTML5 Canvas for annotation
- Base64 image storage in session memory
- EmailJS for email reports (no backend)
- WhatsApp deep link for team notifications
- Firebase optional (recommended for production storage)

## Structure

```
src/
├── screens/          # One folder per screen
│   ├── HomeScreen/   # Area grid + meta inputs + submit gate
│   ├── AreaScreen/   # Photo list + camera trigger
│   ├── AnnotateScreen/ # Full-screen canvas annotation
│   ├── ReviewScreen/ # Pre-submission summary
│   └── SuccessScreen/
├── components/       # Shared UI components
│   ├── AreaCard/     # Grid cell (empty / captured states)
│   ├── PhotoCard/    # Photo with edit/delete actions
│   ├── AnnotationCanvas/ # (reserved for future extract)
│   └── ProgressBar/
├── context/
│   └── AuditContext.jsx  # Single source of truth for live audit
├── data/
│   └── areas.js      # 13 areas — 7 required, 6 optional
├── services/
│   ├── emailService.js     # EmailJS submission
│   └── whatsappService.js  # wa.me deep link
├── hooks/
│   └── useCamera.js  # Promise-based camera capture
├── utils/
│   └── imageUtils.js # Image compression + annotated export
└── styles/
    ├── tokens.css    # Brand tokens (colours, radii, spacing)
    └── global.css    # Reset + base styles
```

## Getting started

```bash
cp .env.example .env
# Fill in EmailJS and WhatsApp values in .env

npm install
npm start
```

## Environment variables

See `.env.example` for all required variables.

## Deployment

```bash
npm run deploy   # deploys to GitHub Pages
```

## Post-MVP roadmap

- PDF report generation (jsPDF)
- Multi-bathroom support per session
- Firebase backend for audit storage + history
- Offline mode (PWA service worker)
- Product recommendations per area
