
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { initializeSupabase, isAuthenticated, getUserRole } from './utils/supabaseClient';
import { toast } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from '@/components/ui/spinner';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import DriverManagementPage from './pages/admin/DriverManagementPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ConfigManagementPage from './pages/admin/ConfigManagementPage';
import LandingPage from './pages/LandingPage';
import CitiesManagementPage from './pages/admin/CitiesManagement';

// Lazy-loaded components
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsAuth(auth);

      if (auth) {
        const role = await getUserRole();
        setUserRole(role);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuth) {
    toast.info('Por favor, faça login para acessar esta página.');
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(userRole || '')) {
    toast.error('Você não tem permissão para acessar esta página.');
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const ready = await initializeSupabase();
      setIsSupabaseReady(ready);

      if (ready) {
        toast.success('Supabase inicializado com sucesso!', { duration: 3000 });
      } else {
        toast.error('Falha ao inicializar Supabase. Verifique o console para mais detalhes.', { duration: 5000 });
      }
    };

    initialize();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <Suspense fallback={<Loading />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<Loading />}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suspense fallback={<Loading />}>
                  <CompanyManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suspense fallback={<Loading />}>
                  <DriverManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suspense fallback={<Loading />}>
                  <VehicleManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suspense fallback={<Loading />}>
                  <UserManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute roles={['admin']}>
                <Suspense fallback={<Loading />}>
                  <ConfigManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route path="/admin/cities" element={
            <ProtectedRoute roles={['admin']}>
              <Suspense fallback={<Loading />}>
                <CitiesManagementPage />
              </Suspense>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
