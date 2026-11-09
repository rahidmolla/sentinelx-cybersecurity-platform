import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BrandLandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020403] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,201,120,0.16),transparent_55%)]" />
      <section className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <img src="/images/cyvex-brand.jpg" alt="CYVEX cybersecurity" className="mb-8 h-auto w-[min(480px,82vw)] object-contain drop-shadow-[0_0_34px_rgba(0,255,136,0.18)]" />
        <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.42em] text-[#00ff88] sm:text-xs">Detect. Defend. Trust.</p>
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Security signals.<br /><span className="text-[#00ff88]">Made actionable.</span></h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">A cybersecurity intelligence platform to investigate suspicious URLs, assess website security, and surface evidence for defensive decisions.</p>
        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"><Link to="/scan" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c978] px-6 py-3.5 text-sm font-bold text-[#020403] hover:bg-[#00ff88]">Explore CYVEX <ArrowRight size={17} /></Link><Link to="/home" className="rounded-xl border border-[#00ff88]/35 px-6 py-3.5 text-sm font-semibold text-white">Open dashboard</Link></div>
      </section>
      <section className="relative z-10 mx-auto grid max-w-7xl gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{['URL threat intelligence', 'TLS certificate analysis', 'Website security posture', 'Collaborative threat intel'].map((label, i) => <article key={label} className="rounded-2xl border border-[#173326] bg-[#07100c]/90 p-5"><span className="font-mono text-xs text-[#00c978]">0{i + 1}</span><h2 className="mt-3 text-sm font-bold uppercase tracking-wider">{label}</h2></article>)}</section>
    </main>
  );
}
