import React, { useState } from 'react';
import { certApi } from '../services/api.js';
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Calendar, 
  Key, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export default function CertificateAnalyzerPage() {
  const [target, setTarget] = useState('https://wikipedia.org');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!target.trim()) return;

    setLoading(true);
    setError('');
    try {
      const resp = await certApi.analyze(target.trim());
      setResult(resp.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Certificate inspection failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const cert = result?.certificate;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC POSTURE AUDITOR</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">SSL/TLS Certificate Analyzer</h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Native TLS handshake inspection, Certificate Authority trust validation, and Certificate Transparency logs.
        </p>
      </div>

      {/* Input Bar */}
      <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto">
        <form onSubmit={handleAnalyze} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter domain or URL (e.g. google.com)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !target.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all disabled:opacity-50 shadow-glow-cyan"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Inspect</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 max-w-2xl mx-auto">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Certificate Telemetry View */}
      {cert && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Status Banner */}
          <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-2xl ${cert.status === 'Valid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                {cert.status === 'Valid' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-mono">{cert.subject?.commonName || result.hostname}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Issued by: <span className="text-slate-200">{cert.issuer?.organization || cert.issuer?.commonName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Expires in</span>
                <span className={`font-bold text-sm ${cert.daysRemaining < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {cert.daysRemaining} Days
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${cert.status === 'Valid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                {cert.status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            {/* Validity Timeline */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase text-[11px]">
                <Calendar className="w-4 h-4" />
                <span>Validity Timestamps</span>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Valid From (NotBefore)</span>
                  <span className="text-slate-200">{new Date(cert.validFrom).toUTCString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Valid Until (NotAfter)</span>
                  <span className="text-slate-200">{new Date(cert.validTo).toUTCString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Certificate Expired?</span>
                  <span className={cert.isExpired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {cert.isExpired ? 'EXPIRED' : 'ACTIVE / VALID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Parameters */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-blue-400 font-bold uppercase text-[11px]">
                <Key className="w-4 h-4" />
                <span>Cryptographic Strength</span>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Protocol Negotiated</span>
                  <span className="text-cyan-400 font-bold">{cert.protocolVersion}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cipher Suite</span>
                  <span className="text-slate-200 truncate block">{cert.cipher}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Public Key Size</span>
                  <span className="text-slate-200">{cert.bits || 2048} bits RSA/ECC</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Domain Matches Host</span>
                  <span className={cert.domainMatches ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {cert.domainMatches ? 'MATCHED' : 'HOSTNAME MISMATCH'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Alternative Names (SANs) */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase text-[11px]">
                <Layers className="w-4 h-4" />
                <span>Subject Alt Names ({cert.subjectAltNames?.length || 0})</span>
              </div>
              <div className="pt-2 border-t border-slate-800 max-h-40 overflow-y-auto space-y-1">
                {(cert.subjectAltNames || []).map((san, idx) => (
                  <div key={idx} className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 truncate">
                    {san}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Transparency Section */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Public Certificate Transparency (CT) Logs
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Observable certificates logged for {result.hostname} across public CT monitors (crt.sh)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                RFC 6962
              </span>
            </div>

            {result.ctLogs?.length > 0 ? (
              <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
                {result.ctLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="min-w-0 pr-4">
                      <span className="text-cyan-400 font-semibold truncate block">{log.commonName}</span>
                      <span className="text-slate-500 text-[10px] truncate block">{log.issuerName}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] whitespace-nowrap">
                      {log.loggedAt ? new Date(log.loggedAt).toLocaleDateString() : 'Active Log'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs font-mono">
                No Certificate Transparency records currently cached.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
