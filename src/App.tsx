import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

import AdminDashboard from './pages/admin/Dashboard';
import DatabaseSetup from './pages/admin/DatabaseSetup';
import CreateAdmin from './pages/admin/CreateAdmin';
import TestWorkflow from './pages/admin/TestWorkflow';

import CompanyDashboard from './pages/company/Dashboard';

import DriverDashboard from './pages/driver/Dashboard';
import DriverPanel from './pages/driver/Panel';
import DriverAssignments from './pages/driver/Assignments';
import DriverSchedule from './pages/driver/Schedule';
import DriverNavigation from './pages/driver/Navigation';
import DriverProfile from './pages/driver/Profile';
import DriverSettings from './pages/driver/Settings';
import DriverTrips from './pages/driver/Trips';

import Bookings from './pages/client/Bookings';
import Profile from './pages/client/Profile';
import PaymentMethods from './pages/client/PaymentMethods';

import './App.css';

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <span className="ml-3 text-lg">Carregando...</span>
  </div>
);

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
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to={`/auth?return_to=${location.pathname}`} replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Access denied: User role ${userRole} doesn't match required role ${requiredRole}`);
    
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
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
    
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
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
  
  return <Navigate to="/" replace />;
};

const HomeRedirect = () => {
  const { user, userRole, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    if (userRole === 'company') {
      console.log("HomeRedirect: Redirecting company user to dashboard");
      return <Navigate to="/company/dashboard" replace />;
    } else if (userRole === 'driver') {
      console.log("HomeRedirect: Redirecting driver user to dashboard");
      return <Navigate to="/driver/dashboard" replace />;
    } else if (userRole === 'admin') {
      console.log("HomeRedirect: Redirecting admin user to dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return <Index />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/create" element={<CreateAdmin />} />
            
            <Route path="/dashboard" element={<RoleBasedRedirect />} />
            
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
            <Route path="/admin/test-workflow" element={
              <ProtectedRoute requiredRole="admin">
                <TestWorkflow />
              </ProtectedRoute>
            } />
            
            <Route path="/company/dashboard" element={
              <ProtectedRoute requiredRole="company">
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            
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
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
