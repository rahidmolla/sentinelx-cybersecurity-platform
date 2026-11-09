import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi, scanApi } from '../services/api.js';
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, Users, Database, ArrowRight, ExternalLink, Activity, RefreshCw, FileText, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, BarChart, Bar, CartesianGrid } from 'recharts';

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
      const [statsRes, actRes] = await Promise.all([dashboardApi.getStats(), dashboardApi.getActivity()]);
      setStats(statsRes.data);
      setActivity(actRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard metrics');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    navigate(`/scan?url=${encodeURIComponent(quickUrl.trim())}`);
  };

  if (loading && !stats) return <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4"><RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" /><p className="text-sm font-mono text-slate-400">Loading CYVEX SOC Telemetry...</p></div>;

  const s = stats?.stats || { totalScans: 0, maliciousScans: 0, safeScans: 0, avgRiskScore: 0 };
  const pieData = [{ name: 'Threats', value: s.maliciousScans || 0 }, { name: 'Low Risk', value: s.safeScans || 0 }];
  const COLORS = ['#fb7185', '#00c978'];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold tracking-[0.25em] text-[#00c978]">CYVEX / OPERATIONS</p><h1 className="mt-2 text-3xl font-bold text-white">Security Operations Dashboard</h1><p className="mt-2 text-sm text-slate-400">Threat visibility and scan activity at a glance.</p></div>
        <Link to="/scan" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00c978] px-4 py-2.5 text-sm font-bold text-[#020403] hover:bg-[#00ff88]">Start a scan <ArrowRight size={16} /></Link>
      </div>
      {error && <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-200">{error} <button onClick={fetchData} className="ml-2 underline">Retry</button></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[[Database, 'Total Scans', s.totalScans || 0], [ShieldAlert, 'Threat Signals', s.maliciousScans || 0], [ShieldCheck, 'Low Risk', s.safeScans || 0], [Activity, 'Average Risk', `${s.avgRiskScore || 0}/100`]].map(([Icon, label, value]) => <article key={label} className="glass-panel rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-xs text-slate-400">{label}</span><Icon size={18} className="text-[#00c978]" /></div><p className="mt-4 text-3xl font-bold text-white">{value}</p></article>)}
      </div>
      <form onSubmit={handleQuickScan} className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={quickUrl} onChange={e => setQuickUrl(e.target.value)} placeholder="Enter a URL for a passive security scan" className="w-full rounded-xl border border-[#173326] bg-black/40 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-[#00c978]" /></div><button type="submit" className="rounded-xl bg-[#00c978] px-5 py-2.5 text-sm font-bold text-[#020403] hover:bg-[#00ff88]">Quick Scan</button></form>
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass-panel rounded-2xl p-5 lg:col-span-1"><h2 className="font-semibold text-white">Risk Distribution</h2><div className="mt-4 h-60"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={4}>{pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#07100c', border: '1px solid #173326' }} /></PieChart></ResponsiveContainer></div></section>
        <section className="glass-panel rounded-2xl p-5 lg:col-span-2"><div className="flex items-center justify-between"><h2 className="font-semibold text-white">Recent Activity</h2><Link to="/history" className="text-xs text-[#00c978] hover:text-[#00ff88]">View history <ExternalLink size={12} className="ml-1 inline" /></Link></div>{activity?.activity?.length ? <div className="mt-4 divide-y divide-white/5">{activity.activity.slice(0, 7).map((item, i) => <div key={item._id || i} className="flex items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0"><p className="truncate text-slate-200">{item.hostname || item.originalUrl}</p><p className="mt-1 text-xs text-slate-500">{item.riskLevel || 'Assessment'} · {item.scannedAt ? new Date(item.scannedAt).toLocaleString() : 'Recent'}</p></div><span className="shrink-0 rounded-full border border-[#173326] px-2 py-1 text-xs text-[#00c978]">{item.riskScore ?? '—'}</span></div>)}</div> : <div className="flex min-h-48 flex-col items-center justify-center text-center text-sm text-slate-500"><Clock size={24} className="mb-3 text-[#00c978]" />No recent scans yet. Run a scan to see activity.</div>}</section>
      </div>
      <div className="grid gap-4 md:grid-cols-2"><Link to="/intelligence" className="glass-panel group rounded-2xl p-5"><div className="flex items-center gap-3"><Database className="text-[#00c978]" /><div><h2 className="font-semibold">Threat Intelligence</h2><p className="mt-1 text-xs text-slate-400">Explore public indicators and community reports.</p></div><ArrowRight className="ml-auto text-slate-500 group-hover:text-[#00ff88]" /></div></Link><Link to="/community" className="glass-panel group rounded-2xl p-5"><div className="flex items-center gap-3"><Users className="text-[#00c978]" /><div><h2 className="font-semibold">Community Reports</h2><p className="mt-1 text-xs text-slate-400">Review reports and contribute evidence.</p></div><ArrowRight className="ml-auto text-slate-500 group-hover:text-[#00ff88]" /></div></Link></div>
    </div>
  );
}
