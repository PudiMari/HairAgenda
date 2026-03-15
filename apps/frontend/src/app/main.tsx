import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import '../index.css';

import { ServicesPage } from '../pages/client/ServicesPage';
import { ServiceSelectionPage } from '../pages/client/ServiceSelectionPage';
import { BookingConfirmationPage } from '../pages/client/BookingConfirmationPage';
import { PortfolioPage } from '../pages/client/PortfolioPage';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ServicesConfigPage } from '../pages/admin/ServicesConfigPage';
import { ScheduleConfigPage } from '../pages/admin/ScheduleConfigPage';

import { LandingPage } from '../pages/LandingPage';
import { ProfilePage } from '../pages/client/ProfilePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
        </Route>

        {/* Fluxo do Admin (usando AdminLayout) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/services" element={<ServicesConfigPage />} />
          <Route path="/admin/schedule" element={<ScheduleConfigPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
