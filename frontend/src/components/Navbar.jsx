import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Radar, LayoutDashboard, LockKeyhole, Globe, Users, BrainCircuit, Menu, X, LogOut, Clock3, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/scan', label: 'Scanner', icon: Radar },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/certificates', label: 'TLS & Certs', icon: LockKeyhole },
  { to: '/website-security', label: 'Web Security', icon: Globe },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/intelligence', label: 'Threat Intel', icon: BrainCircuit },
  { to: '/history', label: 'History', icon: Clock3, authOnly: true }
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [demoOpen, setDemoOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#173326] bg-[#020403]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="CYVEX home">
          <img src="/images/cyvex-brand.jpg" alt="CYVEX" className="h-9 w-16 rounded object-contain" />
          <span className="hidden text-[10px] font-semibold tracking-[0.18em] text-[#00c978] sm:block">DETECT. DEFEND. TRUST.</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.filter(item => !item.authOnly || isAuthenticated).map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-[#071b12] text-[#00ff88]' : 'text-slate-300 hover:bg-[#07100c] hover:text-white'}`}><Icon size={15} />{label}</Link>;
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-32 truncate text-xs text-slate-300">{user?.name || user?.email}</span>
              {user?.role === 'admin' && <Link to="/admin" className="rounded-lg border border-[#173326] px-3 py-2 text-xs text-slate-200 hover:border-[#00c978]">Admin</Link>}
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-[#173326] px-3 py-2 text-xs text-slate-200 hover:text-[#00ff88]"><LogOut size={14} />Sign out</button>
            </>
          ) : <Link to="/auth" className="rounded-lg border border-[#00c978]/50 px-3 py-2 text-xs font-semibold text-[#00ff88] hover:bg-[#00c978]/10">Sign in</Link>}
          <Link to="/scan" className="rounded-lg bg-[#00c978] px-4 py-2 text-xs font-bold text-[#020403] transition hover:bg-[#00ff88]">Quick Scan</Link>
        </div>

        <button onClick={() => setMobileOpen(v => !v)} className="rounded-lg p-2 text-white lg:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>

      {mobileOpen && <nav className="border-t border-[#173326] bg-[#020403] px-4 pb-4 pt-2 lg:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-2 gap-2">
          {NAV_ITEMS.filter(item => !item.authOnly || isAuthenticated).map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-[#07100c]"><Icon size={16} />{label}</Link>)}
          {isAuthenticated ? <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-slate-200 hover:bg-[#07100c]"><LogOut size={16} />Sign out</button> : <Link onClick={() => setMobileOpen(false)} to="/auth" className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-slate-200 hover:bg-[#07100c]">Sign in</Link>}
          <Link to="/scan" onClick={() => setMobileOpen(false)} className="col-span-2 rounded-lg bg-[#00c978] px-3 py-3 text-center text-sm font-bold text-[#020403]">Quick Scan</Link>
        </div>
      </nav>}
      {demoOpen && <button type="button" className="sr-only" aria-label="Close demo selector" onClick={() => setDemoOpen(false)}><ChevronDown /></button>}
    </header>
  );
}
