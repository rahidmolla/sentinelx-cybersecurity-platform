import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon } from 'lucide-react';

export default function RiskMeter({ score = 0, level = 'Low Risk', confidence = 85, evidenceCoverage = 'Standard', size = 'normal' }) {
  // Determine color and icons
  let color = '#10b981'; // Green
  let textColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10 border-emerald-500/30';
  let Icon = ShieldCheck;

  if (score >= 80) {
    color = '#ef4444'; // Red
    textColor = 'text-rose-400';
    bgColor = 'bg-rose-500/10 border-rose-500/30';
    Icon = AlertOctagon;
  } else if (score >= 60) {
    color = '#f97316'; // Orange
    textColor = 'text-orange-400';
    bgColor = 'bg-orange-500/10 border-orange-500/30';
    Icon = ShieldAlert;
  } else if (score >= 40) {
    color = '#eab308'; // Amber
    textColor = 'text-amber-400';
    bgColor = 'bg-amber-500/10 border-amber-500/30';
    Icon = AlertTriangle;
  } else if (score >= 20) {
    color = '#3b82f6'; // Blue
    textColor = 'text-blue-400';
    bgColor = 'bg-blue-500/10 border-blue-500/30';
    Icon = ShieldCheck;
  }

  // SVG circular arc calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl glass-panel relative overflow-hidden text-center">
      {/* Background glow matching threat level */}
      <div 
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="relative w-40 h-40 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">{score}</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">/ 100 Risk</span>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className={`mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${bgColor} ${textColor}`}>
        <Icon className="w-4 h-4" />
        <span>{level}</span>
      </div>

      {/* Telemetry info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-around text-[11px] text-slate-400">
        <div>
          <span className="text-slate-500 block">Confidence</span>
          <span className="font-mono font-semibold text-slate-200">{confidence}%</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-slate-500 block">Evidence Coverage</span>
          <span className="font-mono font-semibold text-slate-200">{evidenceCoverage}</span>
        </div>
      </div>
    </div>
  );
}
