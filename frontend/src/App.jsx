import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MatrixRain from './components/MatrixRain';
import BrandLandingPage from './pages/BrandLandingPage';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const ScanHistoryPage = lazy(() => import('./pages/ScanHistoryPage'));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ThreatExplorerPage = lazy(() => import('./pages/ThreatExplorerPage'));
const CertificateAnalyzerPage = lazy(() => import('./pages/CertificateAnalyzerPage'));
const WebsiteSecurityPage = lazy(() => import('./pages/WebsiteSecurityPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AiAssistantModal = lazy(() => import('./components/AiAssistantModal'));
function PageLoader(){return <div className="flex min-h-[60vh] items-center justify-center text-sm text-cyber-muted">Loading CYVEX…</div>;}
function ProtectedRoute({children}){const {user,loading}=useAuth();if(loading)return <PageLoader/>;if(!user)return <Navigate to="/auth" replace/>;return children;}
function AdminRoute({children}){const {user,loading}=useAuth();if(loading)return <PageLoader/>;if(user?.role!=='admin')return <Navigate to="/dashboard" replace/>;return children;}
function AppShell(){const {user,loading}=useAuth();return <><MatrixRain/><div className="relative z-10 flex min-h-screen flex-col"><Navbar/><main className="flex-1"><Suspense fallback={<PageLoader/>}><Routes>
<Route path="/" element={<BrandLandingPage/>}/><Route path="/home" element={<LandingPage/>}/><Route path="/auth" element={user&&!loading?<Navigate to="/dashboard" replace/>:<AuthPage/>}/>
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/><Route path="/scan" element={<ScanPage/>}/><Route path="/history" element={<ProtectedRoute><ScanHistoryPage/></ProtectedRoute>}/><Route path="/reports/:id" element={<ReportDetailPage/>}/><Route path="/community" element={<CommunityPage/>}/><Route path="/intelligence" element={<ThreatExplorerPage/>}/><Route path="/certificates" element={<CertificateAnalyzerPage/>}/><Route path="/website-security" element={<WebsiteSecurityPage/>}/><Route path="/admin" element={<AdminRoute><AdminPage/></ProtectedRoute>}/><Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></Suspense></main><Footer/><Suspense fallback={null}><AiAssistantModal/></Suspense></div></>;}
export default function App(){return <BrowserRouter><AppShell/></BrowserRouter>;}
