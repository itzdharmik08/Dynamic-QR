import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateQRPage } from './pages/CreateQRPage';
import { QRDetailsPage } from './pages/QRDetailsPage';
import { ScannerPage } from './pages/ScannerPage';
import { RedirectPage } from './pages/RedirectPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Dynamic Redirect Route (No Auth, Instant Redirection) */}
            <Route path="/q/:code" element={<RedirectPage />} />

            {/* Public Authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected App Routes wrapped in AppLayout */}
            <Route element={<AppLayout requireAuth={false} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/qr/create" element={<CreateQRPage />} />
              <Route path="/qr/:id" element={<QRDetailsPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
