import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Activity, Globe, LockKeyhole, Radar, Database, ChevronRight } from 'lucide-react';

const capabilities = [
  { icon: Radar, title: 'URL threat scanning', body: 'Review URL characteristics and evidence-backed threat signals.' },
  { icon: LockKeyhole, title: 'TLS certificate analysis', body: 'Check certificate identity, trust chain, and expiration.' },
  { icon: Globe, title: 'Website security posture', body: 'Assess public headers and other passive security indicators.' },
  { icon: Database, title: 'Threat intelligence', body: 'Correlate community and public threat information.' }
];

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    if (url.trim()) navigate(`/scan?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-[#173326] bg-[radial-gradient(ellipse_at_70%_0%,rgba(0,201,120,.16),transparent_50%),#07100c] px-6 py-12 sm:px-12 lg:py-16">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00c978]/30 bg-[#00c978]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00ff88]"><Activity size={13} /> Defensive intelligence platform</div>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl">See the signals.<br /><span className="text-[#00ff88]">Make safer calls.</span></h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Investigate suspicious websites with passive URL, TLS, web security, and threat intelligence checks—all in one evidence-led workspace.</p>
          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 sm:flex-row"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter a URL to inspect" aria-label="URL to inspect" className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500" /><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c978] px-5 py-3 text-sm font-bold text-[#020403] hover:bg-[#00ff88]">Analyze URL <ArrowRight size={16} /></button></form>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400"><span><ShieldCheck className="mr-1 inline h-4 w-4 text-[#00c978]" />Evidence-led</span><span><LockKeyhole className="mr-1 inline h-4 w-4 text-[#00c978]" />Passive checks</span><span><Activity className="mr-1 inline h-4 w-4 text-[#00c978]" />Defensive by design</span></div>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/scan" className="inline-flex items-center gap-2 text-sm font-semibold text-[#00ff88] hover:text-white">Open scanner <ChevronRight size={16} /></Link><Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">View dashboard <ChevronRight size={16} /></Link></div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 hidden h-80 w-80 rounded-full border border-[#00c978]/15 shadow-[0_0_100px_rgba(0,201,120,.12)] lg:block" />
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Platform capabilities">{capabilities.map(({ icon: Icon, title, body }) => <article key={title} className="glass-panel rounded-2xl p-5"><Icon className="text-[#00c978]" size={21} /><h2 className="mt-4 text-sm font-semibold text-white">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-400">{body}</p></article>)}</section>
    </main>
  );
}
