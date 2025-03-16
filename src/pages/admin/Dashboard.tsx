
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import PerformanceReports from '@/components/admin/PerformanceReports';
import DashboardStats from '@/components/admin/DashboardStats';
import { FileText, Settings, UserCheck, ChartBar, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';

const AdminDashboard: React.FC = () => {
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState({
    companies: 0,
    drivers: 0,
    orders: 0,
    loading: true
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fixQueuePositions, resetQueue } = useCompanyQueue();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsRefreshing(true);
      // Fetch companies count
      const { count: companiesCount, error: companiesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      if (companiesError) throw companiesError;
      
      // Fetch drivers count
      const { count: driversCount, error: driversError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });
      
      if (driversError) throw driversError;
      
      // Fetch orders count
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
                <Settings className="mr-2 h-4 w-4" />
                Configuração do Banco
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
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCheck className="h-4 w-4 mr-2" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Ordens de Serviço
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        onClick={() => setActiveTab("orders")}
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
            </div>

            <DashboardStats />
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="orders">
            <ServiceOrderMonitoring />
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
