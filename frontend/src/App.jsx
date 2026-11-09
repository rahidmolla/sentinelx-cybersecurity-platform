import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ScanPage from './pages/ScanPage.jsx';
import ReportDetailPage from './pages/ReportDetailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CertificateAnalyzerPage from './pages/CertificateAnalyzerPage.jsx';
import WebsiteSecurityPage from './pages/WebsiteSecurityPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ThreatExplorerPage from './pages/ThreatExplorerPage.jsx';
import ScanHistoryPage from './pages/ScanHistoryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import BrandLandingPage from './pages/BrandLandingPage.jsx';
import MatrixRain from './components/MatrixRain.jsx';

function ApplicationShell() {
  const location = useLocation();
  const isBrandLanding = location.pathname === '/';
  return (
    <div className="min-h-screen flex flex-col bg-[#020403] text-slate-100">
      {!isBrandLanding && <MatrixRain />}
      <div className="relative z-10 flex min-h-screen flex-col">
        {!isBrandLanding && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<BrandLandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/scan/:id" element={<ReportDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/certificates" element={<CertificateAnalyzerPage />} />
            <Route path="/website-security" element={<WebsiteSecurityPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/intelligence" element={<ThreatExplorerPage />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isBrandLanding && <Footer />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ApplicationShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
