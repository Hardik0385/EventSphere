import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExploreEventsPage } from './pages/public/ExploreEventsPage';
import { EventDetailsPage } from './pages/public/EventDetailsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';

// Participant Pages
import { ParticipantDashboardPage } from './pages/participant/ParticipantDashboardPage';
import { MyRegistrationsPage } from './pages/participant/MyRegistrationsPage';
import { MyTicketsPage } from './pages/participant/MyTicketsPage';
import { ProfileSettingsPage } from './pages/participant/ProfileSettingsPage';

// Organizer Pages
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { ManageEventsPage } from './pages/organizer/ManageEventsPage';
import { EventRegistrationsPage } from './pages/organizer/EventRegistrationsPage';
import { EventAnalyticsPage } from './pages/organizer/EventAnalyticsPage';
import { TicketVerificationPage } from './pages/organizer/TicketVerificationPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { EventManagementPage } from './pages/admin/EventManagementPage';

// Cloud Explorer Page
import { CloudArchitecturePage } from './pages/cloud/CloudArchitecturePage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Role Route Guard
const RoleRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-rose-600">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-2">
          Your role ({user.role}) is not authorized to access this section.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/events" element={<ExploreEventsPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/cloud-architecture" element={<CloudArchitecturePage />} />

                  {/* Participant Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ParticipantDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-registrations"
                    element={
                      <ProtectedRoute>
                        <MyRegistrationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-tickets"
                    element={
                      <ProtectedRoute>
                        <MyTicketsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Organizer Pages */}
                  <Route
                    path="/organizer/dashboard"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <OrganizerDashboardPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/organizer/create-event"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <CreateEventPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/organizer/events"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <ManageEventsPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/:id/registrations"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <EventRegistrationsPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/organizer/events/:id/analytics"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <EventAnalyticsPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/organizer/verify-tickets"
                    element={
                      <RoleRoute allowedRoles={['organizer', 'admin']}>
                        <TicketVerificationPage />
                      </RoleRoute>
                    }
                  />

                  {/* Admin Pages */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                      </RoleRoute>
                    }
                  />
                  <Route
                    path="/admin/events"
                    element={
                      <RoleRoute allowedRoles={['admin']}>
                        <EventManagementPage />
                      </RoleRoute>
                    }
                  />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};
export default App;
