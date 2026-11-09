import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { scanApi } from '../services/api.js';
import RiskMeter from '../components/RiskMeter.jsx';
import FindingCard from '../components/FindingCard.jsx';
import AiAssistantModal from '../components/AiAssistantModal.jsx';
import { 
  ArrowLeft, 
  Download, 
  Bot, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Database,
  ExternalLink
} from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    async function loadScan() {
      setLoading(true);
      try {
        const resp = await scanApi.getScanById(id);
        setScan(resp.data.scan);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Report not found');
      } finally {
        setLoading(false);
      }
    }
    loadScan();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading SentinelX Security Audit Report...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error || 'Scan record could not be located.'}
        </div>
        <Link to="/scan" className="text-xs font-mono text-cyan-400 hover:underline">
          ← Return to Threat Scanner
        </Link>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    window.open(scanApi.getPdfUrl(scan._id || scan.id), '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link to="/history" className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scan Logs</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Consult AI Analyst</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskMeter
          score={scan.riskScore}
          level={scan.riskLevel}
          confidence={scan.confidence}
          evidenceCoverage={scan.evidenceCoverage}
        />

        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-semibold">Verified Target Hostname</span>
            <h1 className="text-2xl font-bold text-white font-mono break-all">{scan.hostname}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1 break-all">{scan.originalUrl}</p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">IP Address</span>
                <span className="text-slate-200 font-semibold truncate block">{scan.ipAddress}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TLS Protocol</span>
                <span className="text-cyan-400 font-semibold">
                  {scan.certificateAnalysis?.certificate?.protocolVersion || 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Threat Status</span>
                <span className={scan.threatIntelligenceResults?.isMalicious ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {scan.threatIntelligenceResults?.isMalicious ? 'Malicious' : 'Clean'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Findings Count</span>
                <span className="text-purple-400 font-bold">{scan.findings?.length || 0} Flagged</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Report ID: {scan._id || scan.id}</span>
            <span>Scanned: {new Date(scan.scannedAt).toUTCString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto text-xs font-mono">
        {[
          { id: 'overview', label: `Recommendations (${scan.recommendations?.length || 0})` },
          { id: 'findings', label: `Findings (${scan.findings?.length || 0})` },
          { id: 'heuristics', label: 'URL & Brand Heuristics' },
          { id: 'tls', label: 'TLS Cryptography' },
          { id: 'headers', label: 'Security Headers' },
          { id: 'dns', label: 'DNS Intelligence' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="glass-panel p-6 rounded-2xl">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Defensive Security Recommendations</h3>
            <div className="space-y-2">
              {(scan.recommendations || []).map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {scan.positiveSignals && scan.positiveSignals.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider mb-2">Positive Security Signals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {scan.positiveSignals.map((sig, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-3">
            {scan.findings?.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs font-mono">
                No security findings flagged.
              </div>
            ) : (
              scan.findings.map(f => (
                <FindingCard key={f.id} finding={f} />
              ))
            )}
          </div>
        )}

        {activeTab === 'heuristics' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 block font-semibold">URL Architecture</span>
              <div>Length: <span className="text-cyan-400">{scan.originalUrl.length} characters</span></div>
              <div>Direct IP: <span className="text-slate-200">{scan.phishingAnalysis?.indicators?.isDirectIp ? 'Yes' : 'No'}</span></div>
              <div>Entropy: <span className="text-cyan-400">{scan.phishingAnalysis?.indicators?.hostEntropy || 3.2} bits</span></div>
            </div>
          </div>
        )}

        {activeTab === 'tls' && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 block font-semibold">TLS Certificate Properties</span>
              <div>Issuer: <span className="text-cyan-400">{scan.certificateAnalysis?.certificate?.issuer?.organization || 'N/A'}</span></div>
              <div>Days Remaining: <span className="text-emerald-400">{scan.certificateAnalysis?.certificate?.daysRemaining ?? 'N/A'} days</span></div>
              <div>Protocol: <span className="text-slate-200">{scan.certificateAnalysis?.certificate?.protocolVersion || 'N/A'}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {Object.entries(scan.websiteSecurityAnalysis?.headers || {}).map(([h, v]) => (
              <div key={h} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">{h}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {v ? 'CONFIGURED' : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'dns' && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2">
            <span className="text-slate-400 block font-semibold">DNS Records</span>
            <div>A Records: <span className="text-cyan-400">{scan.dnsIntelligence?.records?.a?.join(', ') || 'None'}</span></div>
            <div>MX Records: <span className="text-slate-300">{scan.dnsIntelligence?.records?.mx?.join(', ') || 'None'}</span></div>
          </div>
        )}
      </div>

      <AiAssistantModal
        scan={scan}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
