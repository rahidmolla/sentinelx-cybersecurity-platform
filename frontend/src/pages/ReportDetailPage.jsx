import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, CalendarDays, Globe2, Tag } from 'lucide-react';
import { reportApi } from '../services/api';

export default function ReportDetailPage() {
  const id = window.location.pathname.split('/').filter(Boolean).pop();
  const [report, setReport] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    reportApi.getById(id).then(res => { if (alive) setReport(res.data.report); }).catch(err => { if (alive) setError(err.response?.data?.error || 'Could not load this report.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-400">Loading report…</div>;
  if (error || !report) return <div className="mx-auto max-w-4xl px-4 py-20"><p className="text-rose-300">{error || 'Report not found.'}</p><Link to="/community" className="mt-4 inline-flex items-center gap-2 text-sm text-[#00c978]"><ArrowLeft size={15} />Back to community</Link></div>;

  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><Link to="/community" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff88]"><ArrowLeft size={15} />Community reports</Link><article className="glass-panel mt-6 rounded-2xl p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#173326] px-3 py-1 text-xs text-[#00c978]"><ShieldAlert size={14} />{report.status}</span><span className="inline-flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} />{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Date unavailable'}</span></div><h1 className="mt-5 break-words text-2xl font-bold text-white">{report.hostname || report.url}</h1><p className="mt-4 text-sm leading-7 text-slate-300">{report.description}</p><div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-slate-400"><span className="inline-flex items-center gap-2"><Globe2 size={14} />{report.url}</span><span className="inline-flex items-center gap-2"><Tag size={14} />{report.category}</span></div>{report.evidence && <section className="mt-6 rounded-xl border border-[#173326] bg-black/20 p-4"><h2 className="text-xs font-semibold uppercase tracking-wider text-[#00c978]">Submitted evidence</h2><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{report.evidence}</p></section>}</article></main>;
}
