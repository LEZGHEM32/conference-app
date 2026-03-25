import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConferenceDetailPage from './pages/ConferenceDetailPage';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateConferencePage from './pages/CreateConferencePage';
import EditConferencePage from './pages/EditConferencePage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import ConferenceParticipantsPage from './pages/ConferenceParticipantsPage';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/conferences/:id" element={<ConferenceDetailPage />} />
        <Route path="/organizer" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="/conferences/create" element={
          <ProtectedRoute role="organizer"><CreateConferencePage /></ProtectedRoute>
        } />
        <Route path="/conferences/:id/edit" element={
          <ProtectedRoute role="organizer"><EditConferencePage /></ProtectedRoute>
        } />
        <Route path="/conferences/:id/participants" element={
          <ProtectedRoute role="organizer"><ConferenceParticipantsPage /></ProtectedRoute>
        } />
        <Route path="/participant" element={
          <ProtectedRoute role="participant"><ParticipantDashboard /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
