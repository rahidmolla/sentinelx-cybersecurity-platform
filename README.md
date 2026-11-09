# CYVEX — DETECT. DEFEND. TRUST.

A multi-vector cybersecurity intelligence platform for URL threat detection, certificate inspection, website security posture, and collaborative threat intelligence.

- **Updated preview:** [Open CYVEX](https://af8adcd852c3252b8d23.agent37.app) — publicly accessible Agent37 preview.
- **Vercel production domain:** [sentinelx-cybersecurity-platform.vercel.app](https://sentinelx-cybersecurity-platform.vercel.app) — currently serves the previous SentinelX build. The updated design will appear there after the source changes are pushed and Vercel finishes deploying them.

## Overview

CYVEX combines URL heuristics, cryptographic TLS inspection, passive website security auditing, threat intelligence feeds, weighted risk scoring, and evidence-grounded AI explanations in one defensive platform.

## Features

- **URL threat scanner** (`/scan`): URL structure, brand impersonation, IDN homographs, domain entropy, and risk scoring.
- **TLS certificate analyzer** (`/certificates`): certificate details, hostname and expiry checks, and Certificate Transparency lookups.
- **Website security assessment** (`/website-security`): passive security-header, cookie, and `security.txt` checks with hardening guidance.
- **Community threat reports** (`/community`): submit and browse reports with an admin verification workflow.
- **Threat intelligence explorer** (`/intelligence`): searchable indicators and source information.
- **SOC dashboard** (`/dashboard`): scan metrics, visualizations, activity, and threat feeds.
- **AI analyst**: scanner-evidence-grounded explanations; Gemini integration is optional with a deterministic fallback.
- **PDF reports**: export scan results and remediation suggestions.
- **CYVEX landing page** (`/`): supplied logo, Oxanium type, responsive Matrix Rain, and CTA into the existing app. The prior product landing page remains at `/home`.

## Design

Near-black `#020403`, neon green `#00FF88`, secondary green `#00C978`, white, and muted gray. Matrix animation uses a pointer-transparent canvas and respects reduced-motion preferences. The supplied CYVEX logo is used without changing its aspect ratio.

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, Lucide, Framer Motion, Axios |
| Backend | Node.js (ES modules), Express, Helmet, Zod, JWT, bcryptjs, PDFKit |
| Persistence | MongoDB/Mongoose with a local fallback store |
| Intelligence | URLhaus, Certificate Transparency, optional Google Safe Browsing and Gemini integrations |

## Local setup

Prerequisites: Node.js 18+ and npm. MongoDB is optional for local development; without it, the server uses its included fallback store.

### Backend

```bash
cd backend
npm install
npm run dev
```

Default API: `http://localhost:5000` (unless `PORT` is set).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Default UI: `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000` for local development. For a separately hosted API, configure `VITE_API_URL` to its API base URL at build time.

## Environment configuration

Configure backend secrets and API credentials in the backend environment, never in frontend `VITE_*` values. See `backend/.env.example` for supported variables. `GEMINI_API_KEY` and `GOOGLE_SAFE_BROWSING_API_KEY` are optional. Use a unique `JWT_SECRET` and a durable database for hosted production; the local fallback store is not intended for production persistence.

## Safe test fixtures

The scanner UI includes controlled simulated phishing fixtures to demonstrate detection without contacting live malicious hosts. Use the explicitly labeled simulated samples. Fixture outcomes are synthetic and should not be interpreted as live threat-feed checks.

## API overview

- Authentication: `/api/auth/*`
- URL scans and PDF export: `/api/scans/*`
- Certificate analysis: `/api/certificates/analyze`
- Website security analysis: `/api/security/analyze`
- Community reports: `/api/reports/*`
- Dashboard and activity: `/api/dashboard/*`
- Threat intelligence: `/api/intelligence/*`
- AI explanations: `/api/ai/explain`
- Health: `/api/health`

## Security and responsible use

CYVEX applies pre-resolution and IP checks to mitigate SSRF, revalidates redirect destinations, and uses timeouts for passive outbound checks. Scanner output assesses observable evidence and is not a guarantee that a target is safe. Scan only systems you are authorized to assess, and follow applicable laws and responsible-disclosure practices.
