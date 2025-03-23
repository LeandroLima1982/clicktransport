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
import { FileText, Settings, UserCheck, ChartBar, Loader2, LogOut, RefreshCw, TestTube, DollarSign, Paintbrush, Database, Bell, HelpCircle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
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

  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma em um único lugar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={fetchDashboardStats} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Atualizar Dados
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/database-setup">
                <Database className="mr-2 h-4 w-4" />
                Banco de Dados
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/test-workflow">
                <TestTube className="mr-2 h-4 w-4" />
                Ambiente de Testes
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={isAuthenticating}>
              {isAuthenticating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sair
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-9 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Empresas</span>
              <span className="sm:hidden">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ordens de Serviço</span>
              <span className="sm:hidden">Ordens</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Motoristas</span>
              <span className="sm:hidden">Motoristas</span>
            </TabsTrigger>
            <TabsTrigger value="destinations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Destinos</span>
              <span className="sm:hidden">Destinos</span>
            </TabsTrigger>
            <TabsTrigger value="rates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Taxas & Preços</span>
              <span className="sm:hidden">Taxas</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Paintbrush className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Aparência</span>
              <span className="sm:hidden">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                <CardHeader>
                  <CardTitle>Suporte ao Sistema</CardTitle>
                  <CardDescription>Acesso às ferramentas de suporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center"
                      asChild
                    >
                      <Link to="/admin/database-setup">
                        <Database className="mr-2 h-4 w-4" />
                        Configuração do Banco
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center"
                      asChild
                    >
                      <Link to="/admin/test-workflow">
                        <TestTube className="mr-2 h-4 w-4" />
                        Ambiente de Testes
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Documentação do Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DashboardStats />
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="orders">
            <ServiceOrderMonitoring />
          </TabsContent>

          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Motoristas</CardTitle>
                <CardDescription>Gerencie motoristas de todas as empresas na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60 flex-col space-y-4">
                  <Settings className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                  <Button>Explorar Motoristas</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="destinations">
            <DestinationManagement />
          </TabsContent>

          <TabsContent value="rates">
            <TripRateSettings />
          </TabsContent>
          
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Notificações</CardTitle>
                <CardDescription>Configure e envie notificações para usuários da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60 flex-col space-y-4">
                  <Bell className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                  <Button>Configurar Notificações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <PerformanceReports />
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
