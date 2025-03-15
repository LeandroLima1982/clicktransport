import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';

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
import DriverTrips from './pages/driver/Trips';

// Client pages
import Bookings from './pages/client/Bookings';
import Profile from './pages/client/Profile';
import PaymentMethods from './pages/client/PaymentMethods';

import './App.css';

// Improved loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-lg">Carregando...</span>
  </div>
);

// Enhanced Protected Route component with strict role checking
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
  
  // Only show loading spinner during initial auth check
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // If no user is logged in, redirect to auth with return path
  if (!user) {
    return <Navigate to={`/auth?return_to=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If role is required and user doesn't have it, handle redirect
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

// Simple component for public routes that don't need protection
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function App() {
  const { isLoading } = useAuth();
  
  // Show a full-page loading spinner during initial auth check
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/admin/create" element={<PublicRoute><CreateAdmin /></PublicRoute>} />
        
        {/* Admin routes - strictly for admin users */}
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
        
        {/* Company routes - strictly for company users */}
        <Route path="/company/dashboard" element={
          <ProtectedRoute requiredRole="company">
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        
        {/* Driver routes - strictly for driver users */}
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
        <Route path="/driver/trips" element={
          <ProtectedRoute requiredRole="driver">
            <DriverTrips />
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
        
        {/* Client routes - strictly for client users */}
        <Route path="/bookings" element={
          <ProtectedRoute requiredRole="client">
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute requiredRole="client">
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/payment-methods" element={
          <ProtectedRoute requiredRole="client">
            <PaymentMethods />
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
