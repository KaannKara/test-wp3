import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import SendMessage from './pages/dashboard/SendMessage';
import Groups from './pages/dashboard/Groups';
import ScheduledMessages from './pages/dashboard/ScheduledMessages';
import Users from './pages/dashboard/Users';
import Settings from './pages/dashboard/Settings';
import SpecialEvents from './pages/dashboard/SpecialEvents';
import TestHeader from './pages/TestHeader';

// Private route component
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    // While checking authentication status, show loading
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return state.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();
  
  if (state.loading) {
    // While checking authentication status, show loading
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Check if user is authenticated and is an admin
  if (!state.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return state.user && state.user.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <WhatsAppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-header" element={<TestHeader />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/send-message" 
              element={
                <PrivateRoute>
                  <SendMessage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/groups" 
              element={
                <PrivateRoute>
                  <Groups />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/scheduled-messages" 
              element={
                <PrivateRoute>
                  <ScheduledMessages />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/special-events" 
              element={
                <PrivateRoute>
                  <SpecialEvents />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } 
            />
            {/* Catch all route - 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </WhatsAppProvider>
    </AuthProvider>
  );
}

export default App;
