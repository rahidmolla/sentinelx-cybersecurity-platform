# CYVEX — DETECT. DEFEND. TRUST.

Multi-vector cybersecurity intelligence for URL threat detection, TLS certificate inspection, passive website security assessment, and collaborative threat intelligence.

- **CYVEX preview:** [Open the updated landing page](https://af8adcd852c3252b8d23.agent37.app) — public Agent37 preview link.
- **Vercel production:** [sentinelx-cybersecurity-platform.vercel.app](https://sentinelx-cybersecurity-platform.vercel.app) — the current deployment will reflect CYVEX after the source update is deployed.

## Features

- URL threat scanning and weighted risk scoring (`/scan`)
- TLS certificate inspection (`/certificates`)
- Passive website security checks (`/website-security`)
- Community threat reports (`/community`)
- Searchable threat intelligence (`/intelligence`)
- SOC dashboard and scan history (`/dashboard`, `/history`)
- Evidence-grounded AI explanations and PDF reports
- Separate brand landing page (`/`) with supplied logo, Oxanium typography, responsive Matrix Rain, and entry into the existing app. Previous product landing page remains at `/home`.

## Design

CYVEX uses near-black `#020403`, neon green `#00FF88` and `#00C978`, Oxanium typography, and the supplied logo at its original aspect ratio. Matrix Rain is a lightweight, pointer-transparent canvas and respects reduced-motion preferences.

## Stack

React, Vite, Tailwind CSS, React Router, Node.js, Express, MongoDB/Mongoose with a local fallback, and optional Gemini and Google Safe Browsing integrations.

## Local development

Prerequisites: Node.js 18+ and npm. MongoDB is optional locally; the backend uses its included fallback store when no database is configured.

Start the API:

```bash
cd backend
npm install
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

The UI defaults to `http://localhost:5173` and the API to `http://localhost:5000`. Vite proxies `/api` to the local API. Configure `VITE_API_URL` at build time when using a separately hosted API. Backend options are documented in `backend/.env.example`; keep secrets server-side.

## API overview

Authentication `/api/auth/*`, scans `/api/scans/*`, certificates `/api/certificates/analyze`, site security `/api/security/analyze`, reports `/api/reports/*`, dashboard `/api/dashboard/*`, intelligence `/api/intelligence/*`, AI `/api/ai/explain`, and health `/api/health`.

## Responsible use

CYVEX checks observable evidence and does not guarantee a target is safe. Scans are intended for authorized defensive use only. Simulated fixtures produce synthetic outcomes and do not contact the listed host.