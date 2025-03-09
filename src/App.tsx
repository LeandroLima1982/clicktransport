
// Add imports for authentication context
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';

// Import pages and components
import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import DatabaseSetup from './pages/admin/DatabaseSetup';

// Company pages
import CompanyDashboard from './pages/company/Dashboard';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverPanel from './pages/driver/Panel';

import './App.css';

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }: { children: React.ReactNode, requiredRole?: string | null }) => {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/database-setup" element={
            <ProtectedRoute requiredRole="admin">
              <DatabaseSetup />
            </ProtectedRoute>
          } />
          
          {/* Company routes */}
          <Route path="/company/dashboard" element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } />
          
          {/* Driver routes */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute requiredRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver/panel" element={
            <ProtectedRoute requiredRole="driver">
              <DriverPanel />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
