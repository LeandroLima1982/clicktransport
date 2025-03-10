// Add imports for authentication context
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';

// Import pages and components
import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import DatabaseSetup from './pages/admin/DatabaseSetup';
import CreateAdmin from './pages/admin/CreateAdmin';

// Company pages
import CompanyDashboard from './pages/company/Dashboard';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverPanel from './pages/driver/Panel';
import DriverAssignments from './pages/driver/Assignments';
import DriverSchedule from './pages/driver/Schedule';
import DriverNavigation from './pages/driver/Navigation';
import DriverProfile from './pages/driver/Profile';
import DriverSettings from './pages/driver/Settings';

import './App.css';

// Enhanced Protected Route component with role checking and redirection
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  redirectTo = null
}: { 
  children: React.ReactNode, 
  requiredRole?: string | null,
  redirectTo?: string | null
}) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // If no user is logged in, redirect to auth
  if (!user) {
    return <Navigate to={`/auth?return_to=${location.pathname}`} replace />;
  }
  
  // If role is required and user doesn't have it, redirect based on their actual role
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Access denied: User role ${userRole} doesn't match required role ${requiredRole}`);
    
    // Custom redirect if provided
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Otherwise redirect based on user role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    } else if (userRole === 'driver') {
      return <Navigate to="/driver/dashboard" replace />;
    } else if (userRole === 'client') {
      return <Navigate to="/bookings" replace />;
    }
    
    // Fallback to home
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Component to redirect based on user role, with special handling for company users
const RoleBasedRedirect = () => {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userRole === 'company') {
    return <Navigate to="/company/dashboard" replace />;
  } else if (userRole === 'driver') {
    return <Navigate to="/driver/dashboard" replace />;
  } else if (userRole === 'client') {
    return <Navigate to="/bookings" replace />;
  }
  
  // Default for unknown roles
  return <Navigate to="/" replace />;
};

// Special component to handle root path for company users and drivers
const HomeRedirect = () => {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  // If user is logged in and is a company or driver, redirect to their respective dashboards
  if (user) {
    if (userRole === 'company') {
      console.log("HomeRedirect: Redirecting company user to dashboard");
      return <Navigate to="/company/dashboard" replace />;
    } else if (userRole === 'driver') {
      console.log("HomeRedirect: Redirecting driver user to dashboard");
      return <Navigate to="/driver/dashboard" replace />;
    }
  }
  
  // Otherwise show the normal index page
  return <Index />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with special handling for company users */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/create" element={<CreateAdmin />} />
          
          {/* Dashboard redirect based on role */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          
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
          <Route path="/driver/assignments" element={
            <ProtectedRoute requiredRole="driver">
              <DriverAssignments />
            </ProtectedRoute>
          } />
          <Route path="/driver/schedule" element={
            <ProtectedRoute requiredRole="driver">
              <DriverSchedule />
            </ProtectedRoute>
          } />
          <Route path="/driver/navigation" element={
            <ProtectedRoute requiredRole="driver">
              <DriverNavigation />
            </ProtectedRoute>
          } />
          <Route path="/driver/profile" element={
            <ProtectedRoute requiredRole="driver">
              <DriverProfile />
            </ProtectedRoute>
          } />
          <Route path="/driver/settings" element={
            <ProtectedRoute requiredRole="driver">
              <DriverSettings />
            </ProtectedRoute>
          } />
          
          {/* Client routes */}
          <Route path="/bookings" element={
            <ProtectedRoute requiredRole="client">
              <Bookings />
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
