import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { scanApi, reportApi } from '../services/api.js';
import RiskMeter from '../components/RiskMeter.jsx';
import FindingCard from '../components/FindingCard.jsx';
import AiAssistantModal from '../components/AiAssistantModal.jsx';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Database, 
  FileText, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  RefreshCw, 
  Download, 
  Share2, 
  Server, 
  Terminal,
  ExternalLink,
  Info
} from 'lucide-react';

export default function ScanPage() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || '';

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [deepScan, setDeepScan] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDesc, setReportDesc] = useState('');
  const [reportCategory, setReportCategory] = useState('Phishing');
  const [reportSuccess, setReportSuccess] = useState('');

  // Scanning stages animation state
  const [scanStep, setScanStep] = useState(0);
  const scanStages = [
    'Validating IP & SSRF Defense Boundary...',
    'Performing Multi-Vector URL Heuristics & Brand Matching...',
    'Connecting TLS Handshake & Inspecting Certificate Trust...',
    'Analyzing HTTP Response Headers & Redirect Chains...',
    'Cross-Referencing URLhaus & Threat Intelligence Feeds...',
    'Synthesizing Evidence & Computing Weighted Risk Posture...'
  ];

  const handleRunScan = async (targetUrlToScan) => {
    const url = targetUrlToScan || inputUrl;
    if (!url.trim()) return;

    setScanning(true);
    setError('');
    setScanStep(0);

    // Animate scan stages
    const interval = setInterval(() => {
      setScanStep(prev => (prev < scanStages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const resp = await scanApi.scan({ url: url.trim(), deepScan });
      clearInterval(interval);
      setScanResult(resp.data.scan);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || err.message || 'Scan failed to complete');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      setInputUrl(initialUrl);
      handleRunScan(initialUrl);
    }
  }, [initialUrl]);

  const handleDownloadPdf = () => {
    if (!scanResult) return;
    const downloadUrl = scanApi.getPdfUrl(scanResult._id || scanResult.id);
    window.open(downloadUrl, '_blank');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!scanResult) return;
    try {
      await reportApi.submit({
        url: scanResult.normalizedUrl,
        category: reportCategory,
        description: reportDesc || `Community threat reported via SentinelX scanner for ${scanResult.hostname}.`,
        evidence: `Risk Score: ${scanResult.riskScore}/100. Findings: ${(scanResult.findings || []).map(f => f.name).join('; ')}`
      });
      setReportSuccess('Community threat report logged successfully. Our analysts will review.');
      setTimeout(() => {
        setReportSuccess('');
        setReportModalOpen(false);
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    }
  };

  const sampleUrls = [
    { label: 'PayPal Phish (Simulated)', url: 'https://paypal-security-verification.fake-bank-login.com/auth/login.php' },
    { label: 'Apple ID Trap (Simulated)', url: 'https://appleid-support-icloud-secure.info/recover' },
    { label: 'Clean Site (Wikipedia)', url: 'https://wikipedia.org' },
    { label: 'Clean Site (GitHub)', url: 'https://github.com' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Scanner Input Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Multi-Vector URL Threat Scanner
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Inspect suspicious URLs against brand impersonation, TLS anomalies, missing headers, and threat feeds.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRunScan(); }} className="space-y-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={scanning}
                placeholder="Enter URL to inspect (e.g. https://domain.com/login)..."
                className="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl pl-12 pr-40 py-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={scanning || !inputUrl.trim()}
                className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all disabled:opacity-50 shadow-glow-cyan"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyse Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Test Sample Pills */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-500">Test Samples:</span>
                {sampleUrls.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInputUrl(s.url);
                      handleRunScan(s.url);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deepScan}
                  onChange={(e) => setDeepScan(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Deep TLS & Header Inspection</span>
              </label>
            </div>
          </form>
        </div>

        {/* Live scanning progress display */}
        {scanning && (
          <div className="mt-8 pt-6 border-t border-slate-800 text-center max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-center space-x-2 text-cyan-400 font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{scanStages[scanStep]}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 transition-all duration-300"
                style={{ width: `${((scanStep + 1) / scanStages.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-bold">Scan Execution Blocked: </span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Scan Results Container */}
      {scanResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Simulation Notification if test fixture */}
          {scanResult.phishingAnalysis?.isSimulated && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>CONTROLLED TEST FIXTURE: This is a safe simulated test result verifying detection rules without live malicious exploitation.</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-bold">SIMULATED</span>
            </div>
          )}

          {/* Result Overview Header Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Risk Meter */}
            <RiskMeter
              score={scanResult.riskScore}
              level={scanResult.riskLevel}
              confidence={scanResult.confidence}
              evidenceCoverage={scanResult.evidenceCoverage}
            />

            {/* Right: Technical Summary & Action Buttons */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-semibold">Analyzed Target Hostname</span>
                    <h2 className="text-xl font-bold text-white font-mono break-all">{scanResult.hostname}</h2>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>Scanned: {new Date(scanResult.scannedAt).toLocaleTimeString()}</div>
                    <div className="text-slate-500">Latency: {scanResult.scanDurationMs}ms</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Resolved IP</span>
                    <span className="text-slate-200 font-semibold truncate block">{scanResult.ipAddress || 'NXDOMAIN'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TLS Certificate</span>
                    <span className="text-slate-200 font-semibold">
                      {scanResult.certificateAnalysis?.hasTls ? (scanResult.certificateAnalysis.certificate?.status || 'Active') : 'No TLS'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Threat Blacklists</span>
                    <span className={`font-semibold ${scanResult.threatIntelligenceResults?.isMalicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {scanResult.threatIntelligenceResults?.isMalicious ? 'Blacklisted' : 'Clean'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Security Findings</span>
                    <span className="text-cyan-400 font-semibold">{scanResult.findings?.length || 0} flagged</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-glow-blue"
                >
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <span>Explain with AI Analyst</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download PDF Report</span>
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-slate-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Report to Community</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deep Navigation Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto text-xs font-mono">
            {[
              { id: 'overview', label: `Overview & Recommendations (${scanResult.recommendations?.length || 0})` },
              { id: 'findings', label: `Security Findings (${scanResult.findings?.length || 0})` },
              { id: 'heuristics', label: 'Phishing Heuristics' },
              { id: 'tls', label: 'TLS / SSL Profile' },
              { id: 'headers', label: 'Security Headers' },
              { id: 'dns', label: 'DNS Intelligence' },
              { id: 'intel', label: 'Threat Feeds' }
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

          {/* Tab Content Display */}
          <div className="glass-panel p-6 rounded-2xl">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-3">
                    Actionable Defensive Recommendations
                  </h3>
                  <div className="space-y-2">
                    {(scanResult.recommendations || []).map((rec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positive Signals */}
                {scanResult.positiveSignals && scanResult.positiveSignals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase font-mono tracking-wider mb-3">
                      Positive Security Signals Identified ({scanResult.positiveSignals.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {scanResult.positiveSignals.map((sig, i) => (
                        <div key={i} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FINDINGS TAB */}
            {activeTab === 'findings' && (
              <div className="space-y-3">
                {scanResult.findings?.length === 0 ? (
                  <div className="text-center p-8 text-slate-400 text-xs font-mono">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    No critical vulnerabilities, deceptive indicators, or blacklist entries detected.
                  </div>
                ) : (
                  scanResult.findings.map(f => (
                    <FindingCard key={f.id} finding={f} />
                  ))
                )}
              </div>
            )}

            {/* PHISHING HEURISTICS TAB */}
            {activeTab === 'heuristics' && (
              <div className="space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  URL Structural & Brand Impersonation Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block font-semibold">URL Length & Composition</span>
                    <div>Length: <span className="text-cyan-400">{scanResult.phishingAnalysis?.indicators?.urlLength || scanResult.originalUrl.length} chars</span></div>
                    <div>Direct IP Address: <span className={scanResult.phishingAnalysis?.indicators?.isDirectIp ? 'text-rose-400' : 'text-emerald-400'}>{scanResult.phishingAnalysis?.indicators?.isDirectIp ? 'YES (High Risk)' : 'NO (Uses FQDN)'}</span></div>
                    <div>Punycode / IDN: <span className={scanResult.phishingAnalysis?.indicators?.isPunycode ? 'text-rose-400' : 'text-emerald-400'}>{scanResult.phishingAnalysis?.indicators?.isPunycode ? 'YES (Homograph Risk)' : 'NO'}</span></div>
                    <div>Subdomain Depth: <span className="text-slate-200">{scanResult.phishingAnalysis?.indicators?.subdomainCount || 0} subdomains</span></div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block font-semibold">Brand Protection Telemetry</span>
                    <div>
                      Brand Matches: {' '}
                      {scanResult.phishingAnalysis?.indicators?.detectedBrandImpersonations?.length > 0 ? (
                        <span className="text-rose-400 font-bold">
                          {scanResult.phishingAnalysis.indicators.detectedBrandImpersonations.map(b => b.brand).join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-400">None detected</span>
                      )}
                    </div>
                    <div>
                      Lure Keywords: {' '}
                      {scanResult.phishingAnalysis?.indicators?.matchedKeywords?.length > 0 ? (
                        <span className="text-amber-400 font-bold">
                          {scanResult.phishingAnalysis.indicators.matchedKeywords.join(', ')}
                        </span>
                      ) : (
                        <span className="text-emerald-400">No lure keywords</span>
                      )}
                    </div>
                    <div>Entropy Score: <span className="text-cyan-400">{scanResult.phishingAnalysis?.indicators?.hostEntropy || 3.1} bits</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* TLS & CERTIFICATE TAB */}
            {activeTab === 'tls' && (
              <div className="space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Cryptographic SSL/TLS Handshake Posture
                </h3>
                {scanResult.certificateAnalysis?.certificate ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="text-slate-400 block font-semibold">Certificate Subject & Authority</span>
                        <div>Common Name: <span className="text-cyan-400">{scanResult.certificateAnalysis.certificate.subject?.commonName || 'N/A'}</span></div>
                        <div>Issuer: <span className="text-slate-200">{scanResult.certificateAnalysis.certificate.issuer?.organization || scanResult.certificateAnalysis.certificate.issuer?.commonName || 'N/A'}</span></div>
                        <div>Valid From: <span className="text-slate-400">{scanResult.certificateAnalysis.certificate.validFrom?.split('T')[0]}</span></div>
                        <div>Valid Until: <span className="text-slate-400">{scanResult.certificateAnalysis.certificate.validTo?.split('T')[0]}</span></div>
                        <div>Days Remaining: <span className="text-emerald-400 font-bold">{scanResult.certificateAnalysis.certificate.daysRemaining} days</span></div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="text-slate-400 block font-semibold">Cipher & Protocol Details</span>
                        <div>Protocol: <span className="text-cyan-400">{scanResult.certificateAnalysis.certificate.protocolVersion}</span></div>
                        <div>Cipher Suite: <span className="text-slate-200">{scanResult.certificateAnalysis.certificate.cipher}</span></div>
                        <div>Key Strength: <span className="text-slate-200">{scanResult.certificateAnalysis.certificate.bits || 2048} bits</span></div>
                        <div>Self-Signed: <span className={scanResult.certificateAnalysis.certificate.isSelfSigned ? 'text-rose-400' : 'text-emerald-400'}>{scanResult.certificateAnalysis.certificate.isSelfSigned ? 'YES (Untrusted)' : 'NO'}</span></div>
                        <div>Domain Match: <span className={scanResult.certificateAnalysis.certificate.domainMatches ? 'text-emerald-400' : 'text-rose-400'}>{scanResult.certificateAnalysis.certificate.domainMatches ? 'YES' : 'NO (MISMATCH)'}</span></div>
                      </div>
                    </div>

                    {/* Certificate Transparency Logs */}
                    {scanResult.certificateAnalysis?.ctLogs?.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block font-semibold mb-2">Public Certificate Transparency Logs (crt.sh)</span>
                        <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                          {scanResult.certificateAnalysis.ctLogs.map((log, i) => (
                            <div key={i} className="py-2 flex items-center justify-between text-[11px]">
                              <div>
                                <span className="text-cyan-400">{log.commonName}</span>
                                <span className="text-slate-500 block">Issuer: {log.issuerName}</span>
                              </div>
                              <span className="text-slate-400">{log.loggedAt?.split('T')[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    No TLS Certificate observed on target port.
                  </div>
                )}
              </div>
            )}

            {/* SECURITY HEADERS TAB */}
            {activeTab === 'headers' && (
              <div className="space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  HTTP Security Headers & Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(scanResult.websiteSecurityAnalysis?.headers || {}).map(([header, val]) => (
                    <div key={header} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">{header}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                        {val ? 'CONFIGURED' : 'MISSING'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">RFC 9116 Vulnerability Disclosure (security.txt)</span>
                    <span className="text-slate-400 text-[11px]">Direct public contact for security researchers</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scanResult.websiteSecurityAnalysis?.securityTxtFound ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    {scanResult.websiteSecurityAnalysis?.securityTxtFound ? 'FOUND (RFC 9116)' : 'NOT FOUND'}
                  </span>
                </div>
              </div>
            )}

            {/* DNS INTELLIGENCE TAB */}
            {activeTab === 'dns' && (
              <div className="space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  DNS Resolution & RDAP Domain Age
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block font-semibold">Address Records</span>
                    <div>A Records: <span className="text-cyan-400 font-semibold">{scanResult.dnsIntelligence?.records?.a?.join(', ') || 'None'}</span></div>
                    <div>AAAA Records: <span className="text-slate-300">{scanResult.dnsIntelligence?.records?.aaaa?.join(', ') || 'None'}</span></div>
                    <div>MX Mail Servers: <span className="text-slate-300">{scanResult.dnsIntelligence?.records?.mx?.slice(0, 2).join('; ') || 'None configured'}</span></div>
                    <div>Nameservers: <span className="text-slate-300">{scanResult.dnsIntelligence?.records?.ns?.join(', ') || 'None'}</span></div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-400 block font-semibold">RDAP Registration Profile</span>
                    <div>Domain Age: <span className="text-cyan-400 font-semibold">{scanResult.dnsIntelligence?.records?.rdap?.ageInDays ? `${scanResult.dnsIntelligence.records.rdap.ageInDays} days` : 'Available in RDAP'}</span></div>
                    <div>Registrar: <span className="text-slate-300">{scanResult.dnsIntelligence?.records?.rdap?.registrar || 'ICANN Accredited Registrar'}</span></div>
                    <div>Registration Date: <span className="text-slate-400">{scanResult.dnsIntelligence?.records?.rdap?.registeredAt?.split('T')[0] || 'Available in WHOIS'}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* THREAT FEEDS TAB */}
            {activeTab === 'intel' && (
              <div className="space-y-4 text-xs font-mono">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Threat Intelligence Telemetry Feeds Checked
                </h3>
                <div className="divide-y divide-slate-800 bg-slate-900 rounded-xl border border-slate-800 p-4">
                  {(scanResult.sourcesChecked || []).map((source, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-200 font-semibold">{source}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        ACTIVE QUERY COMPLETED
                      </span>
                    </div>
                  ))}
                </div>

                {scanResult.threatIntelligenceResults?.matches?.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 space-y-2">
                    <span className="font-bold text-rose-400 block">Active Intelligence Blacklist Hits:</span>
                    {scanResult.threatIntelligenceResults.matches.map((m, idx) => (
                      <div key={idx} className="text-xs">
                        • <span className="font-bold">{m.source}</span>: {m.details}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grounded Gemini AI Modal */}
      <AiAssistantModal
        scan={scanResult}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Community Report Submission Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Report Suspicious Website</h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {reportSuccess}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Target Host</label>
                  <input
                    type="text"
                    disabled
                    value={scanResult?.hostname}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Threat Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Phishing">Phishing & Credential Theft</option>
                    <option value="Brand Impersonation">Brand Impersonation</option>
                    <option value="Fake Payment">Fake Payment Gateway</option>
                    <option value="Fake Recruitment">Fake Recruitment / Job Scam</option>
                    <option value="Malware Distribution">Malware Distribution</option>
                    <option value="Malicious Redirect">Malicious Redirect</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-mono">Incident Details & Evidence</label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Describe how the phishing lure was received (SMS, email, spoofed sender)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
