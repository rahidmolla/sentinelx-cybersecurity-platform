import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Radar, LockKeyhole, Globe2, Activity, Fingerprint, Eye, Database, ShieldAlert, ChevronRight } from 'lucide-react';

const modules = [
  { icon: Radar, title: 'URL THREAT INTELLIGENCE', description: 'Analyze URLs for deceptive structure, impersonation signals, and reputation evidence.' },
  { icon: LockKeyhole, title: 'TLS CERTIFICATE ANALYSIS', description: 'Inspect certificate identity, trust, validity, and expiry signals.' },
  { icon: Globe2, title: 'WEBSITE SECURITY POSTURE', description: 'Review public security headers, cookies, redirects, and responsible disclosure signals.' },
  { icon: Database, title: 'COLLABORATIVE THREAT INTEL', description: 'Explore community reports and searchable threat intelligence.' }
];

const signals = [
  ['01', 'Observe', 'Collect public-facing signals with passive checks.'],
  ['02', 'Correlate', 'Combine URL, TLS, web posture, and threat feed evidence.'],
  ['03', 'Prioritize', 'Use weighted indicators to guide defensive review.']
];

export default function BrandLandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020403] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,201,120,0.16),transparent_55%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <section className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <img src="/images/cyvex-brand.jpg" alt="CYVEX cybersecurity" className="mb-8 h-auto w-[min(480px,82vw)] object-contain drop-shadow-[0_0_34px_rgba(0,255,136,0.18)]" />
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.42em] text-[#00ff88] sm:text-xs">Detect. Defend. Trust.</p>
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Security signals.<br /><span className="text-[#00ff88]">Made actionable.</span></h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">A focused cybersecurity intelligence platform to investigate suspicious URLs, assess public website security, and surface evidence that supports faster defensive decisions.</p>
        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link to="/scan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c978] px-6 py-3.5 text-sm font-bold text-[#020403] transition hover:bg-[#00ff88] focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-[#020403]">Explore CYVEX <ArrowRight size={17} /></Link>
          <Link to="/home" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00ff88]/35 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#00ff88] hover:bg-[#00ff88]/10">Open dashboard <ChevronRight size={17} /></Link>
        </div>
        <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[[ShieldCheck, 'Evidence-led analysis'], [Eye, 'Passive checks'], [Fingerprint, 'Defensive by design']].map(([Icon, label]) => <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-slate-200"><Icon size={17} className="text-[#00ff88]" />{label}</div>)}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-4" aria-label="CYVEX modules">
        {modules.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-2xl border border-[#173326] bg-[#07100c]/90 p-5 transition hover:border-[#00c978]/60"><Icon size={20} className="text-[#00ff88]" /><h2 className="mt-4 text-xs font-bold tracking-[0.12em]">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-400">{description}</p></article>)}
      </section>

      <section className="relative z-10 border-y border-[#173326] bg-[#050a07]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:grid-cols-3 sm:px-8">
          {signals.map(([number, title, description]) => <div key={number} className="flex gap-4"><span className="font-mono text-sm text-[#00c978]">{number}</span><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-400">{description}</p></div></div>)}
        </div>
      </section>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>CYVEX · DETECT. DEFEND. TRUST.</span><span><Activity className="mr-1 inline-block h-3 w-3 text-[#00c978]" /> Defensive cybersecurity intelligence</span><span><ShieldAlert className="mr-1 inline-block h-3 w-3" /> Scan only systems you are authorized to assess.</span></footer>
    </main>
  );
}
