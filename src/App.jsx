import './App.css'
import { ThemeProvider } from 'next-themes';
import './theme.css';
import './visual-styles.css';
import './customer-design.css';
import VisualStyleProvider from './components/appearance/VisualStyleProvider';
import React, {Suspense} from 'react';
import { MotionConfig } from 'framer-motion';
const TestToolbar = import.meta.env.DEV ? React.lazy(() => import('./test-mode/TestToolbar')) : null;
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MobileNavigation from './native/MobileNavigation';
import { setupIframeMessaging } from './lib/iframe-messaging';
import PageNotFound from './lib/PageNotFound';
import ClinicAppointments from './pages/ClinicAppointments';
import MedicalReports from './pages/MedicalReports';
import TestExplorerOnboarding from './pages/TestExplorerOnboarding';
import ProfileConnection from './pages/ProfileConnection';
import AestheticCare from './pages/AestheticCare';
import ClinicServices from './pages/ClinicServices';
import ClinicTeam from './pages/ClinicTeam';
import ClinicLocation from './pages/ClinicLocation';
import BATOCircles from './pages/BATOCircles';
import Updates from './pages/Updates';
import HairAssessment from './pages/HairAssessment';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SwitchAccount from './pages/SwitchAccount';
import { useLocation, Navigate } from 'react-router-dom';
import { hasStandaloneSession, isStandaloneBuild, standaloneOnboardingComplete } from './test-mode/previewClient';
import SignIn from './pages/SignIn';
import StandaloneErrorBoundary from './native/StandaloneErrorBoundary';
import Welcome from './pages/Welcome';
import { LocationProvider } from './components/LocationContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

setupIframeMessaging();

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const activeLocation = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (!isStandaloneBuild && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <LayoutWrapper currentPageName={mainPageKey}>
      <StandaloneErrorBoundary pathname={activeLocation.pathname}>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<Page />} />
        ))}
        <Route path="/ClinicAppointments" element={<ClinicAppointments />} />
        <Route path="/MedicalReports" element={<MedicalReports />} />
        <Route path="/ClinicServices" element={<ClinicServices />} />
        <Route path="/ClinicTeam" element={<ClinicTeam />} />
        <Route path="/ClinicLocation" element={<ClinicLocation />} />
        <Route path="/HairAssessment" element={<HairAssessment />} />
        <Route path="/BATOCircles" element={<BATOCircles />} />
        <Route path="/Updates" element={<Updates />} />
        <Route path="/TestExplorerOnboarding" element={<TestExplorerOnboarding />} />
        <Route path="/ProfileConnection" element={<ProfileConnection />} />
        <Route path="/AestheticCare" element={<AestheticCare />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </StandaloneErrorBoundary>
    </LayoutWrapper>
  );
};


function AppContent() {
  const location = useLocation();
  // Standalone entry begins at Sign In; retain existing session and onboarding routing.
  if (isStandaloneBuild) {
    const path = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (path === '/welcome') return <Navigate to="/SignIn" replace />;
    if (path === '/signin' || path === '/login' || path === '/demosignin' || path === '/switchaccount') return <SignIn />;
    if (path === '/') return <Navigate to={hasStandaloneSession() ? (standaloneOnboardingComplete() ? '/Dashboard' : '/Onboarding') : '/SignIn'} replace />;
    if (!hasStandaloneSession()) return <Navigate to="/SignIn" replace />;
    if (path !== "/onboarding" && !standaloneOnboardingComplete()) return <Navigate to="/Onboarding" replace />;
    return <AuthenticatedApp />;
  }
  // Account sign-in must remain reachable after logout, outside the auth gate.
  return location.pathname === '/SwitchAccount' ? <SwitchAccount /> : <AuthenticatedApp />;
}

function App() {

  return (
    <ThemeProvider attribute="class" storageKey="bato_theme" defaultTheme="system" enableSystem>
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22 }}>
    <AuthProvider>
    <LocationProvider>
    <VisualStyleProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <MobileNavigation />
          <NavigationTracker />
          <AppContent />
          {TestToolbar && <Suspense fallback={null}><TestToolbar /></Suspense>}
        </Router>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors />
        <VisualEditAgent />
      </QueryClientProvider>
    </VisualStyleProvider>
    </LocationProvider>
    </AuthProvider>
    </MotionConfig>
    </ThemeProvider>
  )
}

export default App