import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import { FileText, Settings, UserCheck, ChartBar, Loader2, AlertTriangle, Users, Car, CalendarCheck, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import DirectBookingAssignment from '@/components/admin/DirectBookingAssignment';

const AdminDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState({
    companies: 0,
    drivers: 0,
    orders: 0,
    vehicles: 0,
    loading: true
  });
  const { getQueueHealthScore, queueHealth } = useQueueDiagnostics();
  const healthScore = getQueueHealthScore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
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
      
      const { count: vehiclesCount, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      if (vehiclesError) throw vehiclesError;
      
      setDashboardStats({
        companies: companiesCount || 0,
        drivers: driversCount || 0,
        orders: ordersCount || 0,
        vehicles: vehiclesCount || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Falha ao carregar estatísticas do dashboard');
      setDashboardStats(prev => ({ ...prev, loading: false }));
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
            <Button asChild variant="outline">
              <Link to="/admin/database-setup">
                <Settings className="mr-2 h-4 w-4" />
                Configuração do Banco
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/queue">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Gerenciar Filas
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg">Saúde do Sistema</CardTitle>
              <CardDescription>Visão geral do status operacional</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-md bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fila de Empresas</p>
                      <h4 className="text-2xl font-bold">{queueHealth?.active_companies || 0}</h4>
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${healthScore?.score >= 90 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {healthScore?.score >= 90 ? 'Saudável' : 'Atenção'}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {queueHealth?.invalid_positions 
                      ? `${queueHealth.invalid_positions} posições inválidas` 
                      : 'Funcionamento normal'}
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Processamento</p>
                      <h4 className="text-2xl font-bold">{healthScore ? `${Math.round(healthScore.score)}%` : 'N/A'}</h4>
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded ${healthScore?.needsAttention ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {healthScore?.needsAttention ? 'Atenção' : 'Normal'}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Eficiência de alocação de recursos
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Disponibilidade</p>
                      <h4 className="text-2xl font-bold">100%</h4>
                    </div>
                    <div className="text-sm font-medium px-2 py-1 rounded bg-green-100 text-green-800">
                      Online
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Serviços operacionais
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Banco de Dados</p>
                      <h4 className="text-2xl font-bold">Conectado</h4>
                    </div>
                    <div className="text-sm font-medium px-2 py-1 rounded bg-green-100 text-green-800">
                      Ativo
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Conexão Supabase estável
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <DirectBookingAssignment />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                Empresas
              </CardTitle>
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
                  <Button 
                    className="mt-4 w-full text-xs"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("companies")}
                  >
                    Ver Empresas
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-500" />
                Motoristas
              </CardTitle>
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
                    className="mt-4 w-full text-xs"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to="/admin/drivers">Ver Motoristas</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-500" />
                Ordens
              </CardTitle>
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
                    className="mt-4 w-full text-xs"
                    variant="outline"
                    size="sm"
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
              <CardTitle className="text-sm font-medium flex items-center">
                <Car className="h-4 w-4 mr-2 text-amber-500" />
                Veículos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardStats.loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <p>Carregando...</p>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold">{dashboardStats.vehicles}</p>
                  <p className="text-sm text-muted-foreground">Total de veículos registrados</p>
                  <Button 
                    className="mt-4 w-full text-xs"
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to="/admin/vehicles">Ver Veículos</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building2 className="h-4 w-4 mr-2" />
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

          <TabsContent value="overview">
            <AdminDashboardStats />
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="orders">
            <ServiceOrderMonitoring />
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eficiência de Entregas</CardTitle>
                  <CardDescription>Análise de tempo de entrega por região</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho de Motoristas</CardTitle>
                  <CardDescription>Top motoristas por avaliação e eficiência</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
