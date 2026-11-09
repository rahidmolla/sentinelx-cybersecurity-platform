import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
