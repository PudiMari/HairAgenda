import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import '../index.css';

import { ServicesPage } from '../pages/client/ServicesPage';
import { ServiceSelectionPage } from '../pages/client/ServiceSelectionPage';
import { BookingConfirmationPage } from '../pages/client/BookingConfirmationPage';
import { PortfolioPage } from '../pages/client/PortfolioPage';
import { MyBookingsPage } from '../pages/client/MyBookingsPage';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ServicesConfigPage } from '../pages/admin/ServicesConfigPage';
import { ScheduleConfigPage } from '../pages/admin/ScheduleConfigPage';
import { AdminGuard } from '../components/auth/AdminGuard';

import { LandingPage } from '../pages/LandingPage';
import { ProfilePage } from '../pages/client/ProfilePage';
import { ClerkProvider } from '@clerk/react';

import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          fontFamily: 'system-ui, sans-serif', 
          backgroundColor: '#fff', 
          color: '#333', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          textAlign: 'center' 
        }}>
          <h1 style={{ color: '#e11d48', marginBottom: '1rem' }}>Ops! Algo deu errado.</h1>
          <p style={{ marginBottom: '1.5rem', maxWidth: '500px' }}>
            Não conseguimos carregar a HairAgenda no momento. Pode ser um erro de configuração ou conexão.
          </p>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f1f5f9', 
            borderRadius: '0.5rem', 
            fontSize: '0.875rem', 
            textAlign: 'left',
            fontFamily: 'monospace'
          }}>
            <strong>Tipo do Erro:</strong> {this.state.error?.message}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '2rem', 
              padding: '0.625rem 1.25rem', 
              backgroundColor: '#1e293b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem', 
              cursor: 'pointer' 
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Failed to find the root element");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        {!PUBLISHABLE_KEY ? (
          <div style={{ 
            padding: '2rem', 
            fontFamily: 'system-ui, sans-serif', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
          }}>
            <h1 style={{ color: '#e11d48' }}>Configuração Incompleta</h1>
            <p>A chave do Clerk (VITE_CLERK_PUBLISHABLE_KEY) não foi encontrada.</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Por favor, configure esta variável no painel do Vercel.</p>
          </div>
        ) : (
          <ClerkProvider 
            publishableKey={PUBLISHABLE_KEY} 
            afterSignOutUrl="/"
          >
            <BrowserRouter>
              <Routes>
                {/* Tela Inicial / Login */}
                <Route path="/" element={<LandingPage />} />

                {/* Fluxo do Cliente (usando RootLayout) */}
                <Route element={<RootLayout />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/book/services" element={<ServiceSelectionPage />} />
                  <Route path="/book/confirm" element={<BookingConfirmationPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                </Route>

                {/* Fluxo do Admin (usando AdminLayout) Protegido */}
                <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/services" element={<ServicesConfigPage />} />
                  <Route path="/admin/schedule" element={<ScheduleConfigPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ClerkProvider>
        )}
      </ErrorBoundary>
    </StrictMode>,
  );
}
