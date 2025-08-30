import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Context hooks
import { useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard components
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';

// Event components
import EventsPage from './pages/events/EventsPage';
import EventDetailsPage from './pages/events/EventDetailsPage';
import CreateEventPage from './pages/events/CreateEventPage';
import EditEventPage from './pages/events/EditEventPage';
import ManageEventsPage from './pages/events/ManageEventsPage';

// Profile components
import ProfilePage from './pages/profile/ProfilePage';

// Admin components
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageParticipantsPage from './pages/admin/ManageParticipantsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import SendNotificationPage from './pages/admin/SendNotificationPage';

// Participant components
import MyRegistrationsPage from './pages/participant/MyRegistrationsPage';

// Notification components
import NotificationsPage from './pages/notifications/NotificationsPage';

// Protected Route component
import ProtectedRoute from './components/common/ProtectedRoute';

// Error components
import NotFoundPage from './pages/errors/NotFoundPage';

// Test utilities (for debugging)
import './utils/testAuth';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner only during initial authentication check
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} 
          />
          <Route 
            path="/forgot-password" 
            element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'admin' && <AdminDashboard />}
                {user?.role === 'organizer' && <OrganizerDashboard />}
                {user?.role === 'participant' && <ParticipantDashboard />}
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Organizer Routes */}
          <Route
            path="/create-event"
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-event/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <EditEventPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-events"
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <ManageEventsPage />
              </ProtectedRoute>
            }
          />

          {/* Participant Routes */}
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute allowedRoles={['participant', 'organizer', 'admin']}>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/manage-categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/participants"
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <ManageParticipantsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <SendNotificationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      <Footer />
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
