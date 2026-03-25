import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import ParticipantDashboard from './pages/ParticipantDashboard';
import ConferenceDetail from './pages/ConferenceDetail';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={
          user ? (user.role === 'organizer' ? <Navigate to="/organizer" /> : <Navigate to="/participant" />) : <Navigate to="/login" />
        } />
        <Route path="/organizer" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="/participant" element={
          <ProtectedRoute role="participant"><ParticipantDashboard /></ProtectedRoute>
        } />
        <Route path="/conferences/:id" element={
          <ProtectedRoute><ConferenceDetail /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
