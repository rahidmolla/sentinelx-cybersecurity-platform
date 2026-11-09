import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-[#173326] bg-[#020403]/95 py-10 text-xs text-[#a0a0a0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-base font-extrabold tracking-wider text-white">
              <img src="/images/cyvex-brand.jpg" alt="CYVEX" className="h-8 w-14 rounded object-contain" />
              <span>CYVEX</span>
            </div>
            <p className="text-[10px] tracking-[0.2em] text-[#00c978]">DETECT. DEFEND. TRUST.</p>
            <p className="text-xs leading-relaxed text-[#a0a0a0]">AI-powered phishing detection, multi-vector cryptographic website security assessment and collaborative threat intelligence.</p>
            <div className="flex items-center gap-2 text-[11px] text-[#00e982]"><span className="h-2 w-2 rounded-full bg-[#00ff88]" /><span>SSRF Filter & Passive Heuristic Engine Online</span></div>
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-200">Detection Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/scan" className="transition-colors hover:text-[#00ff88]">URL Threat Scanner</Link></li>
              <li><Link to="/certificates" className="transition-colors hover:text-[#00ff88]">TLS Certificate Analyzer</Link></li>
              <li><Link to="/website-security" className="transition-colors hover:text-[#00ff88]">HTTP Security Assessment</Link></li>
              <li><Link to="/intelligence" className="transition-colors hover:text-[#00ff88]">Threat Intel Explorer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-200">About CYVEX</h4>
            <ul className="space-y-2">
              <li><Link to="/community" className="transition-colors hover:text-[#00ff88]">Community</Link></li>
              <li><Link to="/history" className="transition-colors hover:text-[#00ff88]">Scan History</Link></li>
              <li><Link to="/auth" className="transition-colors hover:text-[#00ff88]">Account</Link></li>
              <li><Link to="/" className="transition-colors hover:text-[#00ff88]">Home</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-200">Security & Compliance</h4>
            <ul className="space-y-2 text-[11px]">
              <li>OWASP-aligned passive checks</li>
              <li>SSRF-protected outbound requests</li>
              <li>Evidence-led risk scoring</li>
              <li>Responsible-use guidance</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-[#173326] pt-4 text-[10px] sm:flex-row">
          <span>© {new Date().getFullYear()} CYVEX. DETECT. DEFEND. TRUST.</span>
          <span>Defensive intelligence. Evidence first.</span>
        </div>
      </div>
    </footer>
  );
}
