import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi, scanApi } from '../services/api.js';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Users, 
  Database, 
  ArrowRight, 
  ExternalLink, 
  Activity, 
  RefreshCw,
  FileText,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickUrl, setQuickUrl] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivity()
      ]);
      setStats(statsRes.data);
      setActivity(actRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    navigate(`/scan?url=${encodeURIComponent(quickUrl.trim())}`);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading SentinelX SOC Telemetry...</p>
      </div>
    );
  }

  const s = stats?.stats || {
    totalScans: 0,
    safeWebsites: 0,
    suspiciousWebsites: 0,
    maliciousWebsites: 0,
    communityReports: 0,
    confirmedThreats: 0
  };

  const threatDist = stats?.visualizations?.threatDistribution || [];
  const riskDist = stats?.visualizations?.riskDistribution || [];
  const timeline = activity?.scanActivityTimeline || [];
  const recentScans = activity?.recentScans || [];
  const latestThreats = activity?.latestThreats || [];

  const PIE_COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#06b6d4'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Quick Scan Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Security Operations Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Live Centralized Threat Intelligence & Website Risk Monitoring
          </p>
        </div>

        {/* Quick Scan Bar */}
        <form onSubmit={handleQuickScan} className="flex items-center space-x-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Quick scan URL or domain..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
          >
            <span>Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Top 5 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Scanned */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Total Scanned</span>
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">{s.totalScans}</div>
          <div className="text-[11px] text-cyan-400/80 mt-1 font-mono">Database Validated</div>
        </div>

        {/* Safe Websites */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Safe Sites</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">{s.safeWebsites}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Low Risk Posture</div>
        </div>

        {/* Suspicious Websites */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2">{s.suspiciousWebsites}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Moderate / Caution</div>
        </div>

        {/* Malicious Websites */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Malicious Threats</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 mt-2">{s.maliciousWebsites}</div>
          <div className="text-[11px] text-rose-400/80 mt-1 font-mono">High & Critical Traps</div>
        </div>

        {/* Community Reports */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Community Reports</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-purple-400 mt-2">{s.communityReports}</div>
          <div className="text-[11px] text-purple-400/80 mt-1 font-mono">{s.confirmedThreats} Confirmed Threats</div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Distribution (PieChart) */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Threat Category Distribution</h3>
            <span className="text-[10px] text-slate-400 font-mono">Active Signatures</span>
          </div>
          <div className="h-64">
            {threatDist.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={threatDist}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {threatDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                No active threats recorded
              </div>
            )}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
            {threatDist.map((d, i) => (
              <div key={i} className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                <span className="truncate">{d.name} ({d.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scan Activity Over Time (AreaChart) */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Telemetry Scan Velocity (7 Days)</h3>
            <span className="text-[10px] text-cyan-400 font-mono">Timeline Telemetry</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontMono />
                <YAxis stroke="#64748b" fontSize={10} fontMono allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="total" name="Total Scans" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="threats" name="Malicious Detected" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-end space-x-4 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400"></span>
              <span>Total Ingress Scans</span>
            </div>
            <div className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400"></span>
              <span>Malicious Matches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Scans & Threat Intelligence Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans Table */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Recent Website Scans</h3>
            </div>
            <Link to="/history" className="text-xs font-mono text-cyan-400 hover:underline">
              View History →
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No scans performed yet. Enter a URL above to run your first security assessment.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 overflow-x-auto">
              {recentScans.map((scan) => {
                let badgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                if (scan.riskScore >= 80) badgeClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                else if (scan.riskScore >= 60) badgeClass = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
                else if (scan.riskScore >= 40) badgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                return (
                  <div key={scan._id || scan.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-4">
                      <Link 
                        to={`/scan/${scan._id || scan.id}`}
                        className="font-semibold text-slate-200 hover:text-cyan-400 truncate block max-w-xs"
                      >
                        {scan.hostname}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {scan.findings?.length || 0} finding(s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${badgeClass}`}>
                        {scan.riskScore}/100
                      </span>
                      <Link
                        to={`/scan/${scan._id || scan.id}`}
                        className="text-slate-500 hover:text-cyan-400 p-1"
                        title="View detailed report"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Threat Intelligence Feed */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Live Threat Intelligence Feed</h3>
            </div>
            <Link to="/intelligence" className="text-xs font-mono text-cyan-400 hover:underline">
              Explore All →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {latestThreats.map((threat) => (
              <div key={threat._id || threat.id} className="py-3 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-4">
                  <span className="font-semibold text-rose-300 truncate block max-w-xs">
                    {threat.hostname}
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="text-purple-400">{threat.threatType}</span>
                    <span>•</span>
                    <span>{threat.source}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border-rose-500/30">
                  {threat.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
