import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MatrixRain from './components/MatrixRain';
import BrandLandingPage from './pages/BrandLandingPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import ReportDetailPage from './pages/ReportDetailPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import AiAssistantModal from './components/AiAssistantModal';
import CertificatesPage from './pages/CertificatesPage';
import WebsiteSecurityPage from './pages/WebsiteSecurityPage';
import CommunityPage from './pages/CommunityPage';
import ThreatIntelPage from './pages/ThreatIntelPage';
import ScanHistoryPage from './pages/ScanHistoryPage';

function AppShell() {
  const isBrandRoute = useLocation().pathname === '/';
  return (
    <div className="min-h-screen flex flex-col bg-[#020403] text-slate-100">
      {!isBrandRoute && <MatrixRain />}
      <div className="relative z-10 flex min-h-screen flex-col">
        {!isBrandRoute && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<BrandLandingPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/scan/:id" element={<ReportDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/website-security" element={<WebsiteSecurityPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/intelligence" element={<ThreatIntelPage />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!isBrandRoute && <Footer />}
        <AiAssistantModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
