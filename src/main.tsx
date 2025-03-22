
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import Index from './pages/Index.tsx'
import Auth from './pages/Auth.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import NotFound from './pages/NotFound.tsx'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from 'next-themes'
import ClientDashboard from './pages/client/index.tsx'
import ClientProfile from './pages/client/Profile.tsx'
import ClientBookings from './pages/client/Bookings.tsx'
import ClientPaymentMethods from './pages/client/PaymentMethods.tsx'
import CompanyDashboard from './pages/company/Dashboard.tsx'
import AdminDashboard from './pages/admin/Dashboard.tsx'
import DriverManagementPage from './pages/admin/DriverManagement.tsx'
import AdminConfigPage from './pages/admin/ConfigPage.tsx'
import AdminCreateAccount from './pages/admin/CreateAdmin.tsx'
import AdminDatabaseSetup from './pages/admin/DatabaseSetup.tsx'
import AdminTestWorkflow from './pages/admin/TestWorkflow.tsx'
import DriverPanel from './pages/driver/Panel.tsx'
import DriverDashboard from './pages/driver/Dashboard.tsx'
import DriverAssignments from './pages/driver/Assignments.tsx'
import DriverTrips from './pages/driver/Trips.tsx'
import DriverNavigation from './pages/driver/Navigation.tsx'
import DriverSchedule from './pages/driver/Schedule.tsx'
import DriverProfile from './pages/driver/Profile.tsx'
import DriverSettings from './pages/driver/Settings.tsx'
import { Toaster as SonnerToaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Index />} />
                <Route path="auth" element={<Auth />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                
                {/* Client Routes */}
                <Route path="client">
                  <Route index element={<ClientDashboard />} />
                  <Route path="profile" element={<ClientProfile />} />
                  <Route path="bookings" element={<ClientBookings />} />
                  <Route path="payment-methods" element={<ClientPaymentMethods />} />
                </Route>
                
                {/* Company Routes */}
                <Route path="company">
                  <Route index element={<CompanyDashboard />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="admin">
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="drivers" element={<DriverManagementPage />} />
                  <Route path="config" element={<AdminConfigPage />} />
                  <Route path="create" element={<AdminCreateAccount />} />
                  <Route path="database" element={<AdminDatabaseSetup />} />
                  <Route path="test" element={<AdminTestWorkflow />} />
                </Route>
                
                {/* Driver Routes */}
                <Route path="driver">
                  <Route index element={<DriverPanel />} />
                  <Route path="dashboard" element={<DriverDashboard />} />
                  <Route path="assignments" element={<DriverAssignments />} />
                  <Route path="trips" element={<DriverTrips />} />
                  <Route path="navigation" element={<DriverNavigation />} />
                  <Route path="schedule" element={<DriverSchedule />} />
                  <Route path="profile" element={<DriverProfile />} />
                  <Route path="settings" element={<DriverSettings />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <SonnerToaster position="top-right" closeButton />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
