import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { login, register, quickLogin } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'register') await register(form);
      else await login({ email: form.email, password: form.password });
      window.location.assign('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally { setLoading(false); }
  };

  const handleQuickLogin = async (role) => {
    setError(''); setLoading(true);
    try { await quickLogin(role); window.location.assign('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Demo sign-in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <main className="mx-auto grid min-h-[75vh] max-w-5xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
      <section className="hidden lg:block"><p className="text-xs font-semibold tracking-[0.3em] text-[#00c978]">CYVEX ACCESS</p><h1 className="mt-4 text-4xl font-bold leading-tight">Security intelligence,<br /><span className="text-[#00ff88]">with context.</span></h1><p className="mt-4 max-w-md text-sm leading-7 text-slate-400">Sign in to view your scan history and analyst workspace.</p><div className="mt-7 flex items-center gap-3 text-xs text-slate-500"><Shield size={16} className="text-[#00c978]" /> Existing SentinelX sign-in sessions remain compatible.</div></section>
      <section className="glass-panel rounded-2xl p-6 sm:p-8"><div className="mb-6"><h2 className="text-2xl font-bold">{mode === 'login' ? 'Sign in' : 'Create account'}</h2><p className="mt-2 text-xs text-slate-400">{mode === 'login' ? 'Access your security workspace.' : 'Create a CYVEX account to save scans.'}</p></div>
        {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-200"><AlertCircle size={16} />{error}</div>}
        {notice && <div className="mb-4 flex gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-200"><CheckCircle2 size={16} />{notice}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && <label className="block text-xs text-slate-300">Full name<div className="relative mt-1"><User className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[#173326] bg-black/30 py-2.5 pl-10 pr-3 text-sm" /></div></label>}
          <label className="block text-xs text-slate-300">Email<div className="relative mt-1"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-[#173326] bg-black/30 py-2.5 pl-10 pr-3 text-sm" /></div></label>
          <label className="block text-xs text-slate-300">Password<div className="relative mt-1"><Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-[#173326] bg-black/30 py-2.5 pl-10 pr-10 text-sm" /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-2.5 text-slate-500">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00c978] py-3 text-sm font-bold text-[#020403] hover:bg-[#00ff88] disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}{mode === 'login' ? 'Sign in' : 'Register'}</button>
        </form>
        <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="mt-4 w-full text-center text-xs text-slate-400 hover:text-[#00ff88]">{mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
        <div className="my-5 border-t border-white/10" />
        <p className="text-center text-[10px] uppercase tracking-widest text-slate-500">Demo workspaces</p>
        <div className="mt-3 grid grid-cols-2 gap-3"><button disabled={loading} onClick={() => handleQuickLogin('analyst')} className="rounded-xl border border-[#173326] px-3 py-2.5 text-xs text-slate-300 hover:border-[#00c978]">Analyst Demo</button><button disabled={loading} onClick={() => handleQuickLogin('admin')} className="rounded-xl border border-[#173326] px-3 py-2.5 text-xs text-slate-300 hover:border-[#00c978]">Admin Demo</button></div>
      </section>
    </main>
  );
}
