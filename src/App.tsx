import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Protected Portal Pages
import DashboardView from './components/DashboardView';
import HospitalsView from './components/HospitalsView';
import HospitalDetailView from './components/HospitalDetailView';
import DepartmentDetailView from './components/DepartmentDetailView';
import DoctorDetailView from './components/DoctorDetailView';
import AppointmentsView from './components/AppointmentsView';
import BookingWizard from './components/BookingWizard';
import AppointmentDetailView from './components/AppointmentDetailView';
import QueueView from './components/QueueView';
import JourneyView from './components/JourneyView';
import NavigationView from './components/NavigationView';
import NotificationsView from './components/NotificationsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';

// Central TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Unauthenticated Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Authenticated Patient Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/hospitals" element={<HospitalsView />} />
                <Route path="/hospitals/:hospitalId" element={<HospitalDetailView />} />
                <Route path="/departments/:departmentId" element={<DepartmentDetailView />} />
                <Route path="/doctors/:doctorId" element={<DoctorDetailView />} />
                <Route path="/appointments" element={<AppointmentsView />} />
                <Route path="/appointments/book" element={<BookingWizard />} />
                <Route path="/appointments/:appointmentId" element={<AppointmentDetailView />} />
                <Route path="/queue/:appointmentId" element={<QueueView />} />
                <Route path="/journey/:appointmentId" element={<JourneyView />} />
                <Route path="/navigation/:appointmentId" element={<NavigationView />} />
                <Route path="/notifications" element={<NotificationsView />} />
                <Route path="/profile" element={<ProfileView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Route>
            </Route>

            {/* Default Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
