import React, { useState, useEffect } from 'react';
import { reportApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Users, 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  XCircle,
  FileText
} from 'lucide-react';

export default function CommunityPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Form state
  const [newUrl, setNewUrl] = useState('');
  const [category, setCategory] = useState('Phishing');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const resp = await reportApi.getAll({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined
      });
      setReports(resp.data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newUrl.trim() || !description.trim()) return;

    setSubmitting(true);
    setFeedback({ text: '', type: '' });
    try {
      await reportApi.submit({
        url: newUrl.trim(),
        category,
        description,
        evidence
      });
      setFeedback({ text: 'Threat report submitted successfully for security analyst review.', type: 'success' });
      setNewUrl('');
      setDescription('');
      setEvidence('');
      setTimeout(() => {
        setSubmitModalOpen(false);
        setFeedback({ text: '', type: '' });
        fetchReports();
      }, 1800);
    } catch (err) {
      setFeedback({
        text: err.response?.data?.error || err.message || 'Submission failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed Threat':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Under Review':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'False Positive':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
        return 'bg-slate-800 text-slate-500 border-slate-700';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Submit Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Community Threat Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Collaborative reporting of phishing portals, fraudulent payment traps, and brand impersonation.
          </p>
        </div>

        <button
          onClick={() => setSubmitModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-glow-blue w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Report Suspicious Target</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by domain, URL, or keyword lure..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          {['all', 'Confirmed Threat', 'Under Review', 'Pending', 'False Positive'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Reports' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="p-12 text-center">
          <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">Loading Community Intelligence...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3 rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No community threat reports found</h3>
          <p className="text-xs text-slate-500 font-mono">
            Be the first to submit a newly observed phishing campaign or fraudulent website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => (
            <div key={rep._id || rep.id} className="glass-panel p-5 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                      {rep.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono mt-1.5 truncate">
                    {rep.hostname}
                  </h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase whitespace-nowrap ${getStatusBadge(rep.status)}`}>
                  {rep.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {rep.description}
              </p>

              {rep.evidence && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 break-all">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Evidence:</span>
                  {rep.evidence}
                </div>
              )}

              {rep.verificationDetails && (
                <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                  <span className="font-bold">Analyst Verification: </span>
                  {rep.verificationDetails}
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>By: {rep.reportedBy?.name || 'Community Member'}</span>
                <a
                  href={`/scan?url=${encodeURIComponent(rep.url)}`}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <span>Verify via Scanner</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Submit Suspicious Threat Target</h3>
              <button onClick={() => setSubmitModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {feedback.text && (
              <div className={`p-3 rounded-xl border text-xs ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">Suspicious Website URL *</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://paypal-update.fake-login.xyz/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Threat Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="Phishing">Phishing & Credential Theft</option>
                  <option value="Brand Impersonation">Brand Impersonation</option>
                  <option value="Fake Payment">Fake Payment Gateway / Banking Fraud</option>
                  <option value="Fake Recruitment">Fake Recruitment / Remote Job Scam</option>
                  <option value="Malware Distribution">Malware Distribution / C2</option>
                  <option value="Malicious Redirect">Malicious Redirect</option>
                  <option value="Other">Other Cyber Threat</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Incident Description & Lure Analysis *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain how the target attempted deception (e.g. sent fake SMS notification regarding DHL shipment, asked for full card credentials)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono">Supporting Technical Evidence</label>
                <textarea
                  rows={2}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="DNS records, recipient email headers, lookalike domain parameters, or related indicators..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Threat Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
