import React, { useState, useEffect } from 'react';
import { reportApi, authApi, dashboardApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Activity,
  Layers,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [activeReportId, setActiveReportId] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    async function loadAdminData() {
      setLoading(true);
      try {
        const [repRes, dashRes] = await Promise.all([
          reportApi.getAll({}),
          dashboardApi.getStats()
        ]);
        setReports(repRes.data.reports || []);
        setStats(dashRes.data.stats || null);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [isAdmin, navigate]);

  const handleStatusChange = async (reportId, newStatus) => {
    setActionLoading(reportId);
    try {
      const resp = await reportApi.updateStatus(reportId, {
        status: newStatus,
        verificationDetails: verificationNote || `Updated to ${newStatus} by Security Operations Admin`
      });

      setReports(reports.map(r => ((r._id || r.id) === reportId ? resp.data.report : r)));
      setActiveReportId(null);
      setVerificationNote('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update report');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>SentinelX SOC Administration & Threat Verification</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Validate community submissions, promote verified threats to intelligence database, and oversee system metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/80 px-3 py-1.5 rounded-xl">
          <Lock className="w-3.5 h-3.5" />
          <span>Role: Security Administrator ({user?.email})</span>
        </div>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-slate-400 text-xs font-mono block">Pending Reviews</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {reports.filter(r => r.status === 'Pending' || r.status === 'Under Review').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-slate-400 text-xs font-mono block">Confirmed Threats</span>
          <span className="text-2xl font-bold text-rose-400 font-mono mt-1 block">
            {reports.filter(r => r.status === 'Confirmed Threat').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-slate-400 text-xs font-mono block">False Positives</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {reports.filter(r => r.status === 'False Positive').length}
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-slate-400 text-xs font-mono block">Total Ingress Scans</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">
            {stats?.totalScans || 0}
          </span>
        </div>
      </div>

      {/* Community Reports Verification Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Pending Community Threat Submissions
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Review incident descriptions and promote verified phishing campaigns into the global threat feed.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
              Loading Verification Queue...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No reports awaiting review.
            </div>
          ) : (
            reports.map((rep) => {
              const id = rep._id || rep.id;
              const isSelected = activeReportId === id;

              return (
                <div key={id} className="py-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-white">{rep.hostname}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                          {rep.category}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          rep.status === 'Confirmed Threat' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          rep.status === 'False Positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                        URL: {rep.url}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`/scan?url=${encodeURIComponent(rep.url)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono flex items-center space-x-1"
                      >
                        <span>Scan Target</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setActiveReportId(isSelected ? null : id)}
                        className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
                      >
                        {isSelected ? 'Close Actions' : 'Verify Report'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 font-bold block mb-1 uppercase text-[10px]">Description:</span>
                    {rep.description}
                  </p>

                  {/* Verification action panel */}
                  {isSelected && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 animate-in fade-in">
                      <label className="text-[11px] font-mono text-slate-300 block font-semibold">
                        Analyst Verification Notes (Included in Threat Telemetry):
                      </label>
                      <input
                        type="text"
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        placeholder="e.g., Confirmed PayPal phishing toolkit hosted on bulletproof server..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                      />

                      <div className="flex flex-wrap gap-2 pt-1 text-xs font-mono">
                        <button
                          onClick={() => handleStatusChange(id, 'Confirmed Threat')}
                          disabled={actionLoading === id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm Threat (Promote to Blacklist)</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(id, 'Under Review')}
                          disabled={actionLoading === id}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                        >
                          Mark Under Review
                        </button>
                        <button
                          onClick={() => handleStatusChange(id, 'False Positive')}
                          disabled={actionLoading === id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Mark False Positive
                        </button>
                        <button
                          onClick={() => handleStatusChange(id, 'Rejected')}
                          disabled={actionLoading === id}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                          Reject / Invalid
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
