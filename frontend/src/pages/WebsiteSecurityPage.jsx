import React, { useState } from 'react';
import { secApi } from '../services/api.js';
import FindingCard from '../components/FindingCard.jsx';
import { 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Code, 
  Copy, 
  Check, 
  Terminal,
  FileCode,
  Shield
} from 'lucide-react';

export default function WebsiteSecurityPage() {
  const [url, setUrl] = useState('https://github.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState('');

  const handleAudit = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    try {
      const resp = await secApi.analyze(url.trim());
      setResult(resp.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Website assessment failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(''), 2000);
  };

  const nginxSnippet = `# Recommended Nginx Defensive Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;`;

  const apacheSnippet = `# Recommended Apache .htaccess Defensive Headers
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self';"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  ServerSignature Off
</IfModule>`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-mono font-medium">
          <Globe className="w-3.5 h-3.5" />
          <span>PASSIVE HTTP & HEADER AUDITING</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Website Security Configuration Assessment</h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Non-destructive security header evaluation, cookie flag auditing, and RFC 9116 vulnerability contact checks.
        </p>
      </div>

      {/* Input */}
      <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto">
        <form onSubmit={handleAudit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g. https://yourcompany.com)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all disabled:opacity-50 shadow-glow-cyan"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Run Assessment</span>}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Audit Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Posture Matrix */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Observable Security Headers & Flags Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {[
                { name: 'Strict-Transport-Security (HSTS)', val: result.headers?.strictTransportSecurity, desc: 'Prevents SSL stripping' },
                { name: 'Content-Security-Policy (CSP)', val: result.headers?.contentSecurityPolicy, desc: 'Mitigates XSS injection' },
                { name: 'X-Frame-Options', val: result.headers?.xFrameOptions, desc: 'Anti-Clickjacking defense' },
                { name: 'X-Content-Type-Options', val: result.headers?.xContentTypeOptions, desc: 'nosniff MIME protection' },
                { name: 'Referrer-Policy', val: result.headers?.referrerPolicy, desc: 'Token & path leakage defense' },
                { name: 'Permissions-Policy', val: result.headers?.permissionsPolicy, desc: 'Hardware & sensor restrictions' }
              ].map(item => (
                <div key={item.name} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.val ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    {item.val ? 'CONFIGURED' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          {result.findings?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Configuration Weaknesses & Recommendations ({result.findings.length})
              </h3>
              {result.findings.map(f => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}

          {/* Hardening Snippets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nginx */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Nginx Server Hardening</span>
                <button
                  onClick={() => copyToClipboard(nginxSnippet, 'nginx')}
                  className="flex items-center space-x-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200"
                >
                  {copiedSnippet === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'nginx' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {nginxSnippet}
              </pre>
            </div>

            {/* Apache */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase">Apache .htaccess Hardening</span>
                <button
                  onClick={() => copyToClipboard(apacheSnippet, 'apache')}
                  className="flex items-center space-x-1 text-[11px] font-mono text-purple-300 hover:text-purple-200"
                >
                  {copiedSnippet === 'apache' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'apache' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {apacheSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
