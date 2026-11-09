# 🛡️ SentinelX: AI-Powered Phishing Detection & Threat Intelligence Platform

> **"Know Before You Trust."**  
> An enterprise-grade, multi-vector cybersecurity platform designed to protect individuals, organizations, and security operations centers (SOC) from deceptive phishing links, SSL/TLS cryptographic weaknesses, and emerging online threats.

---

## 🌟 Executive Overview & Architecture

SentinelX rejects single-vector decision models. Phishers routinely acquire valid TLS certificates and clone authentic HTML. To accurately determine whether a website is trustworthy, SentinelX combines five independent security layers:

```
                                  [ User Target Input ]
                                            │
                                            ▼
                        [ 🛡️ Controlled Pre-Resolution & SSRF Boundary ]
                        (Rejects 127.0.0.1, 10.0.0.0/8, 169.254.169.254, etc.)
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
[ 1. URL Heuristics ] [ 2. Cryptographic TLS ]  [ 3. Passive HTTP Security ] [ 4. Threat Feeds ]
 • Brand Impersonation • Peer Certificate SANs   • Strict-Transport-Security  • abuse.ch URLhaus
 • Shannon Entropy     • Trust Chain Verification • Content-Security-Policy    • Google Safe Browsing
 • Punycode / IDN      • Validity & Expiration   • Anti-Clickjacking (XFO)    • Community Intel
 • Lure Keywords       • crt.sh Transparency     • RFC 9116 security.txt      • Internal Blacklist
        │                   │                               │                   │
        └───────────────────┴───────────────┬───────────────┴───────────────────┘
                                            ▼
                           [ ⚖️ Weighted Risk Scoring Engine ]
                                  (Score: 0 to 100)
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
        [ 🤖 Grounded Gemini AI Analyst ]           [ 📄 Executive PDF Export ]
         Evidence-based cyber guidance              Audit-ready SOC security reports
```

---

## 🚀 Key Modules & Capabilities

1. **Multi-Vector URL Threat Scanner (`/scan`)**:
   - URL length, subdomain depth, raw IP address detection.
   - Brand impersonation detection against monitored institutions (PayPal, Apple, Microsoft, Google, Chase, Netflix, Steam, DHL, Binance).
   - Punycode / Internationalized Domain Name (IDN) homograph attack detection.
   - Domain Shannon entropy measurement for detecting algorithmic domains (DGA).
   - RFC 9116 `security.txt` discovery.
   - Comprehensive weighted risk gauge (0–100) with confidence rating.

2. **Dedicated SSL/TLS Certificate Analyzer (`/certificates`)**:
   - Live native Node.js TLS socket handshake.
   - Issuer, Subject Alternative Names (SANs), cipher suites, protocol versions (TLSv1.3/TLSv1.2).
   - Real-time queries to Certificate Transparency logs via `crt.sh`.
   - Detection of expired, self-signed, and hostname-mismatched certificates.

3. **Passive Website Security Assessment (`/website-security`)**:
   - Verification of `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `X-Frame-Options` (Clickjacking), `X-Content-Type-Options` (nosniff), and `Referrer-Policy`.
   - Inspection of cookie flags (`Secure`, `HttpOnly`, `SameSite`).
   - Copyable hardening code snippets for Nginx and Apache.

4. **Collaborative Community Threat Intelligence (`/community`)**:
   - Community submission form for phishing lures, fake job portals, and fraudulent payment gateways.
   - Lifecycle tracking: `Pending` → `Under Review` → `Confirmed Threat` → `False Positive` → `Rejected`.
   - Duplicate submission protection and search filtering.

5. **Threat Intelligence Explorer (`/intelligence`)**:
   - Searchable repository of active malicious endpoints and threat signatures.
   - Brand impersonation tag cloud and source attribution.

6. **Centralized SOC Dashboard (`/dashboard`)**:
   - Dynamic metrics computed directly from database telemetry: Total Scans, Safe Sites, Suspicious Sites, Malicious Threats, Community Reports.
   - Recharts visual analytics: Threat Category Distribution (PieChart), Scan Velocity over Time (AreaChart), and Risk Distribution.

7. **Grounded Gemini AI Security Analyst**:
   - Strictly grounded on backend scanner telemetry.
   - Explains *why* a specific score was assigned, details cryptographic risks, and suggests defensive actions without hallucinating CVEs.

8. **Audit-Ready PDF Security Reports**:
   - One-click binary PDF export via PDFKit featuring executive summaries, risk scores, findings breakdown, and remediation steps.

9. **Security Operations Center Administration (`/admin`)**:
   - Administrator-only verification queue.
   - One-click promotion of verified community reports into the global threat database.

---

## 🔐 Critical Security & SSRF Protection

SentinelX is designed as a secure scanner:
- **DNS Pinning & Validation**: Hostnames are resolved through `dns.resolve4`/`dns.resolve6` before establishing connections.
- **Strict IP Blacklisting**: Automatically blocks:
  - Loopback (`127.0.0.0/8`, `::1`)
  - RFC 1918 Private Ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Carrier-grade NAT (`100.64.0.0/10`)
  - Link-Local & Cloud Metadata (`169.254.0.0/16`, `169.254.169.254`, `metadata.google.internal`)
  - Multicast and broadcast addresses.
- **Safe Redirect Validation**: Follows up to 5 redirects, re-validating the destination host at every hop against SSRF rules.
- **Passive & Non-Destructive**: Never submits user credentials, never executes remote client scripts, and applies strict timeouts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router v6, Recharts, Lucide Icons, Framer Motion, Axios |
| **Backend** | Node.js (ES Modules), Express.js, Helmet, Express Rate Limit, Zod, JWT, bcryptjs, PDFKit, Axios |
| **Persistence** | MongoDB with Mongoose + Automatic embedded persistent fallback store (runs 100% out of the box) |
| **Security Engines**| Native TLS module, Node DNS resolver, URLhaus API, crt.sh CT logs, ICANN RDAP |
| **AI Integration** | Google Gemini API (Grounded prompt engineering with rule-based fallback) |

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** (Windows: `npm.cmd`)
- *(Optional)* Local MongoDB or MongoDB Atlas URI (If not running, SentinelX seamlessly activates its embedded persistent store with pre-seeded threat telemetry).

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*The backend starts on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend starts on `http://localhost:5173`.*

---

## 🔑 Pre-Seeded Accounts for Hackathon Evaluators

For instant evaluation, pre-configured roles are accessible via the **"Demo Switcher"** in the navigation bar or via the Sign In page:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sentinelx.local` | `Admin@123456` | Full Access + Verification Queue (`/admin`) |
| **Security Analyst** | `analyst@sentinelx.local` | `Analyst@123456` | Threat Reporting + Scans + Analytics |
| **Anonymous User** | *No account required* | *N/A* | Public URL Scanner + Landing Page |

---

## 🧪 Controlled Test Fixtures (Safe Evaluation)

To test the application safely without visiting live malware, SentinelX includes controlled test fixtures:

1. **PayPal Brand Impersonation & URLhaus Match (Simulated)**:
   - Target: `https://paypal-security-verification.fake-bank-login.com/auth/login.php`
   - Expected Result: **Critical Risk (Score: 92/100)**, URLhaus Blacklist Hit, Self-Signed TLS warning.
2. **Apple ID Phishing Lure (Simulated)**:
   - Target: `https://appleid-support-icloud-secure.info/recover`
   - Expected Result: **Critical Risk (Score: 88/100)**, Brand Impersonation, Disposable Domain.
3. **Legitimate Safe Baseline**:
   - Target: `https://wikipedia.org` or `https://github.com`
   - Expected Result: **Low Risk (Score: 0–10/100)**, Valid Certificate, HSTS configured, Clean threat feeds.
4. **SSRF Defense Verification**:
   - Target: `http://127.0.0.1:8080/admin` or `http://169.254.169.254/latest/meta-data`
   - Expected Result: **Blocked with HTTP 400 (`SSRF_PROTECTION_BLOCKED`)**.

---

## 📑 REST API Documentation

### Authentication
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate and obtain JWT token
- `GET /api/auth/me` - Retrieve authenticated user profile
- `POST /api/auth/forgot-password` - Token-based password recovery workflow

### Threat Scanning
- `POST /api/scans` - Multi-vector scan (Rate-limited, anonymous allowed)
- `GET /api/scans` - List scans (filtered by user ownership)
- `GET /api/scans/:id` - Detailed scan report
- `DELETE /api/scans/:id` - Delete scan record (Owner or Admin)
- `GET /api/scans/:id/pdf` - Stream binary PDF report

### Specialized Audits
- `POST /api/certificates/analyze` - Dedicated SSL/TLS inspection + crt.sh logs
- `POST /api/security/analyze` - Passive HTTP security headers & security.txt audit

### Community & Admin
- `POST /api/reports` - Submit suspicious target
- `GET /api/reports` - Browse community threat feed (filterable by status)
- `PATCH /api/reports/:id/status` - Admin status verification & promotion to blacklist

### Threat Intelligence & AI
- `GET /api/intelligence` - Browse active threat signatures & tags
- `GET /api/intelligence/search` - Query threat indicators
- `GET /api/dashboard/stats` - SOC real-time metrics
- `GET /api/dashboard/activity` - 7-day velocity timeline
- `POST /api/ai/explain` - Grounded Gemini AI explanation
- `GET /api/health` - Platform status and integration telemetry

---

## 📄 License & Ethical Disclosure
SentinelX is developed for educational and authorized defensive cyber intelligence operations. Scanners operate passively and non-destructively in adherence to responsible disclosure practices and RFC standards.
