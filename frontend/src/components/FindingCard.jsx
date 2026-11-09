import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { name, severity, category, evidence, explanation, recommendation } = finding;

  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Info;

  if (severity === 'Critical') {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = AlertOctagon;
  } else if (severity === 'High') {
    badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    Icon = AlertTriangle;
  } else if (severity === 'Medium') {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
  } else if (severity === 'Low') {
    badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    Icon = Info;
  }

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(recommendation || explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all overflow-hidden">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg border ${badgeColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-slate-100">{name}</span>
              {category && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                  {category}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{evidence}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
            {severity}
          </span>
          <button className="text-slate-500 hover:text-slate-300">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 space-y-3 text-xs">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase font-semibold">Evidence & Public Observables:</span>
            <div className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed break-all">
              {evidence}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase font-semibold">Risk Explanation:</span>
            <p className="mt-1 text-slate-300 leading-relaxed">{explanation}</p>
          </div>

          {recommendation && (
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">Defensive Remediation:</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-[10px] font-mono text-cyan-300 hover:text-cyan-200"
                  title="Copy recommendation"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-slate-200 leading-relaxed">{recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
