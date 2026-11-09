import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scanApi } from '../services/api.js';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon,
  Download
} from 'lucide-react';

export default function ScanHistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const resp = await scanApi.getScans();
      setScans(resp.data.scans || []);
    } catch (err) {
      console.error('Failed to load scan history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this scan record permanently?')) return;

    setDeletingId(id);
    try {
      await scanApi.deleteScan(id);
      setScans(scans.filter(s => (s._id || s.id) !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete scan');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredScans = scans.filter(s => {
    if (levelFilter !== 'all' && s.riskLevel !== levelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.hostname?.toLowerCase().includes(q) ||
        s.originalUrl?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Telemetry Scan History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Historical audit logs of scanned URLs and security posture assessments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past scans by domain or URL..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          {['all', 'Low Risk', 'Moderate Risk', 'Suspicious', 'High Risk', 'Critical Risk'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                levelFilter === lvl
                  ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'All Risks' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Records Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Target Website Hostname</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Score</th>
                <th className="p-4">Findings</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading Scan History...
                  </td>
                </tr>
              ) : filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No scan history records match current criteria.
                  </td>
                </tr>
              ) : (
                filteredScans.map((s) => {
                  const id = s._id || s.id;
                  let badge = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                  if (s.riskScore >= 80) badge = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                  else if (s.riskScore >= 60) badge = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
                  else if (s.riskScore >= 40) badge = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                  return (
                    <tr key={id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <Link to={`/scan/${id}`} className="font-semibold text-slate-200 hover:text-cyan-400 block truncate max-w-sm">
                          {s.hostname}
                        </Link>
                        <span className="text-[10px] text-slate-500 truncate block max-w-sm">{s.originalUrl}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${badge}`}>
                          {s.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-white font-bold">{s.riskScore}/100</td>
                      <td className="p-4 text-slate-400">{s.findings?.length || 0} finding(s)</td>
                      <td className="p-4 text-slate-400">{new Date(s.scannedAt).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/scan/${id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                            title="Open detailed report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={scanApi.getPdfUrl(id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            disabled={deletingId === id}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Delete scan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
