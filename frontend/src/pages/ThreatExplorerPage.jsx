import React, { useState, useEffect } from 'react';
import { intelApi } from '../services/api.js';
import { 
  Database, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Tag, 
  Clock, 
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ThreatExplorerPage() {
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const resp = await intelApi.getAll({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined
      });
      setThreats(resp.data.threats || []);
      setStats(resp.data.stats || null);
    } catch (err) {
      console.error('Failed to load threat intelligence', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchThreats();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>Threat Intelligence Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Active malicious domains, malware distribution endpoints, and brand abuse indicators.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/80 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Feed Synchronized with URLhaus & Internal SOC</span>
        </div>
      </div>

      {/* Brand Impersonation Tag Cloud */}
      {stats?.topTags && stats.topTags.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-bold uppercase">Frequently Targeted Brands & Campaign Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.topTags.map((t, idx) => (
              <button
                key={idx}
                onClick={() => { setSearch(t.tag); fetchThreats(); }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center space-x-1 transition-colors"
              >
                <span>#{t.tag}</span>
                <span className="text-[10px] text-cyan-400 bg-slate-800 px-1 rounded">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threats by hostname, brand tag, or source attribution..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          {['all', 'Phishing', 'Malware Distribution', 'Financial Fraud'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Threats' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Threat Records Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Target Malicious Hostname</th>
                <th className="p-4">Threat Type</th>
                <th className="p-4">Attribution Source</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading Threat Signatures...
                  </td>
                </tr>
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No threat intelligence entries matched current query.
                  </td>
                </tr>
              ) : (
                threats.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-semibold text-rose-300">
                      <div>{t.hostname}</div>
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {t.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-purple-400">{t.threatType}</td>
                    <td className="p-4 text-slate-400">{t.source}</td>
                    <td className="p-4 text-cyan-400 font-bold">{t.confidence}%</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase bg-rose-500/10 text-rose-400 border-rose-500/30">
                        {t.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/scan?url=${encodeURIComponent(`https://${t.hostname}`)}`}
                        className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                      >
                        <span>Analyze</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
