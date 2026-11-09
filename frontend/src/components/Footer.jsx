import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-extrabold text-base tracking-wider">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>SENTINEL<span className="text-cyan-400">X</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-Powered Phishing Detection, Multi-Vector Cryptographic Website Security Assessment & Collaborative Threat Intelligence.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SSRF Filter & Passive Heuristic Engine Online</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Detection Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/scan" className="hover:text-cyan-400 transition-colors">URL Threat Scanner</Link></li>
              <li><Link to="/certificates" className="hover:text-cyan-400 transition-colors">TLS Certificate Analyzer</Link></li>
              <li><Link to="/website-security" className="hover:text-cyan-400 transition-colors">HTTP Security Assessment</Link></li>
              <li><Link to="/intelligence" className="hover:text-cyan-400 transition-colors">Threat Intel Explorer</Link></li>
            </ul>
          </div>

          {/* Threat Feeds */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Integrations & Standards</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-1.5">
                <span className="text-emerald-400">●</span>
                <span>abuse.ch URLhaus API</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-emerald-400">●</span>
                <span>Google Safe Browsing v4</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-emerald-400">●</span>
                <span>Certificate Transparency (crt.sh)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="text-emerald-400">●</span>
                <span>RFC 9116 security.txt Protocol</span>
              </li>
            </ul>
          </div>

          {/* Hackathon Disclaimer */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Security Advisory</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              SentinelX performs non-destructive, passive observational scans only. Results are heuristic indicators grounded on observable public evidence and threat intelligence telemetry.
            </p>
            <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              SentinelX Engine v1.0.0 • Production Stack
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>© {new Date().getFullYear()} SentinelX Security Platform. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <span className="hover:text-slate-400">Non-Destructive Scanning</span>
            <span>•</span>
            <span className="hover:text-slate-400">SSRF Protected</span>
            <span>•</span>
            <span className="hover:text-slate-400">RFC Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
