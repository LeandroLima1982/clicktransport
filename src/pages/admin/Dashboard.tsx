
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import PerformanceReports from '@/components/admin/PerformanceReports';
import DashboardStats from '@/components/admin/DashboardStats';
import QueueDiagnostics from '@/components/admin/QueueDiagnostics';
import TripRateSettings from '@/components/admin/TripRateSettings';
import AppearanceSettings from '@/components/admin/AppearanceSettings';
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';
import AdminSidebar from '@/components/admin/AdminSidebar';
import VehicleCategoriesSettings from '@/components/admin/VehicleCategoriesSettings';
import DriverManagement from '@/components/admin/drivers/DriverManagement';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const AdminDashboard: React.FC = () => {
  const { user, userRole, signOut, isAuthenticating } = useAuth();
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
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    if (activeTab === "overview") {
      newParams.delete('tab');
    } else {
      newParams.set('tab', activeTab);
    }
    
    const newSearch = newParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    if (location.search !== `?${newSearch}` && location.search !== '' && newSearch === '') {
      navigate(newPath, { replace: true });
    } else if (location.search !== `?${newSearch}`) {
      navigate(newPath, { replace: true });
    }
  }, [activeTab, location, navigate]);

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Empresas</CardTitle>
                  <CardDescription>Gerenciar empresas de transporte</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats.loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <p>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{dashboardStats.companies}</p>
                      <p className="text-sm text-muted-foreground">Total de empresas registradas</p>
                      <div className="flex flex-col gap-2 mt-4">
                        <Button 
                          className="w-full"
                          onClick={() => setActiveTab("companies")}
                        >
                          Ver Empresas
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={fixQueuePositions}
                        >
                          Corrigir Fila
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={resetQueue}
                        >
                          Resetar Fila
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Motoristas</CardTitle>
                  <CardDescription>Gerenciar motoristas registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats.loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <p>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{dashboardStats.drivers}</p>
                      <p className="text-sm text-muted-foreground">Total de motoristas registrados</p>
                      <Button 
                        className="mt-4 w-full"
                        onClick={() => setActiveTab("drivers")}
                      >
                        Ver Motoristas
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço</CardTitle>
                  <CardDescription>Acompanhar ordens de transporte</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats.loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <p>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{dashboardStats.orders}</p>
                      <p className="text-sm text-muted-foreground">Total de ordens de serviço</p>
                      <Button 
                        className="mt-4 w-full"
                        onClick={() => setActiveTab("orders")}
                      >
                        Ver Ordens
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Ferramentas de suporte ao sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={fetchDashboardStats}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Atualizar Dados
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("vehicle-categories")}
                    >
                      Categorias de Veículos
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab("notifications")}
                    >
                      Notificações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

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
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Notificações</CardTitle>
              <CardDescription>Configure e envie notificações para usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Notificações de Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure notificações automáticas para eventos do sistema
                      </p>
                      <Button className="w-full">Configurar</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Notificações Push</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure notificações push para aplicativos móveis
                      </p>
                      <Button className="w-full">Configurar</Button>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Enviar Notificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Envie notificações manuais para usuários específicos ou grupos
                    </p>
                    <Button className="w-full">Enviar Nova Notificação</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        );
      case 'reports':
        return <PerformanceReports />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <TransitionEffect>
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full">
          <AdminSidebar signOut={signOut} />
          <SidebarInset className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Painel de Administração</h1>
                <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma em um único lugar</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchDashboardStats} 
                disabled={isRefreshing}
                className="whitespace-nowrap"
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar Dados
              </Button>
            </div>
            
            {renderTabContent()}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default AdminDashboard;
