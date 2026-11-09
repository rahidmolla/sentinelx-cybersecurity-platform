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

Near-black `#020403`, neon green accents, restrained glass surfaces, Oxanium headings/body typography, and an accessible, responsive Matrix background. The supplied logo remains undistorted with its intrinsic ratio.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Lucide.
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, optional Gemini.
- Local fallback: file-backed sample data when MongoDB is not configured. Configure MongoDB and unique secrets for real deployment.

## Local development

Prerequisites: Node.js 18+ and npm. MongoDB is optional locally; the backend uses its included fallback store when no database is configured.

```bash
cd backend && npm install && npm run dev
```

In another terminal:

```bash
cd frontend && npm install && npm run dev
```

Vite uses its development proxy to send `/api` requests to the backend. The frontend defaults to the same-origin `/api` path in production.

## API overview

The Express API is mounted under `/api`; routes cover auth, URL scans, scan history/PDF reports, certificates, website-security assessments, dashboard metrics, threat intelligence, AI explanations, and community reports/admin moderation.

## Responsible use

Use the scanner only on systems you own or have authorization to assess. Network-based checks are intended for defensive analysis; validate deployment SSRF protections and configure production authentication, secrets, and persistent storage before exposing the backend publicly.
