import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Search, 
  ArrowRight, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Cpu, 
  Sparkles, 
  FileText, 
  Zap, 
  Users, 
  ExternalLink,
  ShieldCheck,
  Radar
} from 'lucide-react';

export default function LandingPage() {
  const [urlInput, setUrlInput] = useState('');
  const navigate = useNavigate();

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    navigate(`/scan?url=${encodeURIComponent(urlInput.trim())}`);
  };

  const sampleTargets = [
    { label: 'Safe Domain (Wikipedia)', url: 'https://wikipedia.org', type: 'safe' },
    { label: 'Safe Domain (GitHub)', url: 'https://github.com', type: 'safe' },
    { label: 'Phishing Trap (Simulated)', url: 'https://paypal-security-verification.fake-bank-login.com/auth/login.php', type: 'threat' },
    { label: 'Credential Stealer (Simulated)', url: 'https://appleid-support-icloud-secure.info/recover', type: 'threat' }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Cyber Glow & Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] cyber-radial-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono font-medium shadow-glow-cyan animate-pulse">
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-POWERED THREAT INTELLIGENCE & PHISHING DETECTION</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Know Before <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              You Trust.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            SentinelX unifies multi-signal URL heuristics, TLS cryptographic validation, non-destructive website security auditing, community threat feeds, and grounded Gemini AI analysis into an explainable risk posture.
          </p>

          {/* Working Quick Scanner Input */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form onSubmit={handleScanSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-cyan-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter suspicious URL or hostname (e.g. https://paypal-security-update.fake-auth.xyz)..."
                className="w-full bg-slate-900/90 border-2 border-slate-700/80 hover:border-cyan-500/60 focus:border-cyan-400 rounded-2xl pl-12 pr-36 py-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-2xl backdrop-blur-xl"
              />
              <button
                type="submit"
                className="absolute right-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-glow-cyan"
              >
                <span>Scan Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Sample Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Quick Test Fixtures:</span>
              {sampleTargets.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUrlInput(s.url);
                    navigate(`/scan?url=${encodeURIComponent(s.url)}`);
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    s.type === 'threat'
                      ? 'bg-rose-950/30 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                      : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Platform Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="glass-panel p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">10,480+</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-mono">Live Telemetry Feeds</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">99.8%</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-mono">SSRF Defense Reliability</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-purple-400 font-mono">5-Vector</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-mono">Independent Inspection</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <div className="text-3xl font-extrabold text-blue-400 font-mono">Gemini AI</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-mono">Grounded Cyber Analyst</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">Multi-Vector Architecture</span>
            <h2 className="text-3xl font-bold text-white mt-2">How SentinelX Evaluates Trust</h2>
            <p className="text-slate-400 text-sm mt-3">
              Rather than relying on a single fallible indicator, SentinelX analyzes five independent security vectors simultaneously before computing a weighted risk score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-cyan-500 font-bold">STAGE 01</span>
              <h3 className="text-lg font-bold text-white mt-1">SSRF Defense & URL Heuristics</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Pins DNS and validates private IP ranges to block SSRF. Inspects punycode homographs, Shannon entropy, brand lookalikes, and keyword lures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-blue-500 font-bold">STAGE 02</span>
              <h3 className="text-lg font-bold text-white mt-1">Cryptographic TLS Inspection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Performs native TLS handshakes. Inspects SAN domain coverage, CA issuer trust chains, expiration timestamps, and crt.sh Certificate Transparency logs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-purple-500 font-bold">STAGE 03</span>
              <h3 className="text-lg font-bold text-white mt-1">Website Configuration Audit</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Evaluates HSTS, CSP, X-Frame-Options (Clickjacking defense), MIME sniffing, cookie security flags, and RFC 9116 security.txt vulnerability contacts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">STAGE 04</span>
              <h3 className="text-lg font-bold text-white mt-1">Threat Intel & Grounded AI</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Cross-references URLhaus, Google Safe Browsing, and community intelligence, then feeds structured findings to Gemini AI for explainable guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">Defensive Capabilities</span>
          <h2 className="text-3xl font-bold text-white mt-2">Comprehensive Threat Detection</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h4 className="text-base font-bold text-white">Brand Impersonation Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors deception patterns targeting financial institutions, cloud providers, and global brands (PayPal, Apple, Microsoft, Chase, Netflix).
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <Lock className="w-6 h-6 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Certificate Transparency (CT)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrates crt.sh public logs to detect unexpected wildcard or lookalike SSL certificates issued across global certificate authorities.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h4 className="text-base font-bold text-white">Collaborative Threat Reporting</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allows security analysts and community contributors to report fake payment portals and phishing campaigns with administrator verification workflows.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h4 className="text-base font-bold text-white">Executive PDF Reports</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download professional, audit-ready cybersecurity reports formatted with executive summaries, technical finding cards, and remediation code snippets.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h4 className="text-base font-bold text-white">Grounded Gemini AI Analyst</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly grounded on actual scanner evidence. Explains why a score was assigned, details cryptographic weaknesses, and guides remediation without hallucinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Anti-SSRF Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pre-resolves DNS, rejects loopback (127.0.0.1), private CIDRs (10.0.0.0/8, 192.168.0.0/16), and cloud metadata endpoints (169.254.169.254).
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Secure Your Organization Against Phishing Traps
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Try SentinelX instantly without an account, or log in as an administrator or analyst to access collaborative community intelligence and executive reporting.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/scan')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-glow-cyan transition-all"
            >
              Launch URL Threat Scanner
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-sm transition-all"
            >
              Open Security Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
