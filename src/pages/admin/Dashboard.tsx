
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/auth';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import { FileText, Settings, Building2, Users, Car, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Use more robust queries without head:true parameter
      let companiesCount = 0;
      let driversCount = 0;
      let ordersCount = 0;
      let vehiclesCount = 0;

      // Fetch all data counts
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id');
      
      if (companiesError) throw companiesError;
      companiesCount = companies?.length || 0;
      
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('id');
      
      if (driversError) throw driversError;
      driversCount = drivers?.length || 0;
      
      const { data: orders, error: ordersError } = await supabase
        .from('service_orders')
        .select('id');
      
      if (ordersError) throw ordersError;
      ordersCount = orders?.length || 0;
      
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id');
      
      if (vehiclesError) throw vehiclesError;
      vehiclesCount = vehicles?.length || 0;
      
      setDashboardStats({
        companies: companiesCount,
        drivers: driversCount,
        orders: ordersCount,
        vehicles: vehiclesCount,
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
            <p className="text-muted-foreground">Gerencie empresas, ordens de serviço e mais</p>
          </div>
          <div>
            <Button asChild variant="outline">
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("companies")}>
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
                  <p className="text-sm text-muted-foreground">Total de empresas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab("orders")}>
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
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <p className="text-sm text-muted-foreground">Total de motoristas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <p className="text-sm text-muted-foreground">Total de veículos</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Empresas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ordens de Serviço
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Dashboard Administrativo</CardTitle>
                <CardDescription>
                  Visão geral da plataforma e métricas principais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Status Geral</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Empresas ativas:</span>
                        <span className="font-medium">{dashboardStats.companies}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Ordens em andamento:</span>
                        <span className="font-medium">-</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Motoristas disponíveis:</span>
                        <span className="font-medium">-</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Ações Rápidas</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("companies")}
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        Gerenciar Empresas
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab("orders")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ordens de Serviço
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="orders">
            <ServiceOrderMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
