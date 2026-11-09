import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return <main className="mx-auto max-w-7xl px-4 py-14"><section className="rounded-3xl border border-[#173326] bg-[#07100c] p-10"><p className="text-xs uppercase tracking-[.3em] text-[#00c978]">CYVEX SECURITY OPERATIONS</p><h1 className="mt-4 text-4xl font-bold">Evidence-led website security.</h1><p className="mt-4 max-w-2xl text-slate-300">Use the CYVEX scanner and intelligence modules to examine public security signals.</p><Link className="mt-6 inline-block rounded-lg bg-[#00c978] px-5 py-3 font-bold text-black" to="/scan">Start a scan</Link></section></main>;
}
