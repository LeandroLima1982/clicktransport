
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import PerformanceReports from '@/components/admin/PerformanceReports';
import DashboardStats from '@/components/admin/DashboardStats';
import QueueDiagnostics from '@/components/admin/QueueDiagnostics';
import TripRateSettings from '@/components/admin/TripRateSettings';
import AppearanceSettings from '@/components/admin/AppearanceSettings';
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';
import DocumentationContent from '@/components/admin/DocumentationContent';
import SettingsContent from '@/components/admin/SettingsContent';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';
import AdminSidebar from '@/components/admin/AdminSidebar';
import VehicleCategoriesSettings from '@/components/admin/VehicleCategoriesSettings';
import DriverManagement from '@/components/admin/drivers/DriverManagement';
import PerformanceMetrics from '@/components/admin/PerformanceMetrics';

const AdminDashboard: React.FC = () => {
  const { user, userRole, signOut: authSignOut, isAuthenticating } = useAuth();
  
  const handleSignOut = async () => {
    return await authSignOut();
  };

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabFromQuery || "overview");
  const [dashboardStats, setDashboardStats] = useState({
    companies: 0,
    drivers: 0,
    orders: 0,
    loading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fixQueuePositions, resetQueue } = useCompanyQueue();

  useEffect(() => {
    if (tabFromQuery && tabFromQuery !== activeTab) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  useEffect(() => {
    if ((tabFromQuery === activeTab) || 
        (activeTab === "overview" && !tabFromQuery)) {
      return;
    }
    
    const newParams = new URLSearchParams(location.search);
    
    if (activeTab === "overview") {
      newParams.delete('tab');
    } else {
      newParams.set('tab', activeTab);
    }
    
    const newSearch = newParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    navigate(newPath, { replace: true });
  }, [activeTab, navigate, location.pathname]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsRefreshing(true);
      const { count: companiesCount, error: companiesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      if (companiesError) throw companiesError;
      
      const { count: driversCount, error: driversError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });
      
      if (driversError) throw driversError;
      
      const { count: ordersCount, error: ordersError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true });
      
      if (ordersError) throw ordersError;
      
      setDashboardStats({
        companies: companiesCount || 0,
        drivers: driversCount || 0,
        orders: ordersCount || 0,
        loading: false
      });
      
      toast.success('Dados atualizados com sucesso');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Falha ao carregar estatísticas do dashboard');
    } finally {
      setDashboardStats(prev => ({ ...prev, loading: false }));
      setIsRefreshing(false);
    }
  };

  if (!user || userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button asChild className="mt-4">
          <Link to="/">Retornar à Página Inicial</Link>
        </Button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <QueueDiagnostics />
            <DashboardStats />
          </>
        );
      case 'companies':
        return <CompanyManagement />;
      case 'orders':
        return <ServiceOrderMonitoring />;
      case 'drivers':
        return <DriverManagement />;
      case 'destinations':
        return <DestinationManagement />;
      case 'rates':
        return <TripRateSettings />;
      case 'vehicle-categories':
        return <VehicleCategoriesSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'docs':
        return <DocumentationContent />;
      case 'settings':
        return <SettingsContent />;
      case 'metrics':
        return <PerformanceMetrics />;
      case 'notifications':
      case 'reports':
      case 'content':
      case 'users':
      case 'vehicles':
      case 'investors':
      case 'database':
      case 'tests':
        // These pages can be added in the future
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Em Desenvolvimento</h2>
            <p className="text-muted-foreground">Esta página está em construção e estará disponível em breve.</p>
          </div>
        );
      default:
        return <DashboardStats />;
    }
  };

  return (
    <TransitionEffect>
      <div className="flex w-full min-h-screen">
        <AdminSidebar signOut={handleSignOut} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white border-b p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Painel de Administração</h1>
                <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma em um único lugar</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchDashboardStats} 
                disabled={isRefreshing}
                className="whitespace-nowrap"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Dados
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
