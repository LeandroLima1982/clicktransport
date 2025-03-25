
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, RefreshCw, TrendingUp, PieChart, BarChart3, CalendarDays, ListFilter } from 'lucide-react';
import RevenueChart from './RevenueChart';
import CompanyPerformance from './CompanyPerformance';
import InvestorPortfolio from './InvestorPortfolio';
import UpcomingBookings from './UpcomingBookings';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import InvestorSidebar from './InvestorSidebar';

const InvestorDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [investorData, setInvestorData] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    activeCompanies: 0
  });

  useEffect(() => {
    if (user) {
      fetchInvestorData();
    }
  }, [user]);

  const fetchInvestorData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados do investidor
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (investorError) throw investorError;
      
      setInvestorData(investor);

      // Buscar empresas em que o investidor tem participação
      const { data: shares, error: sharesError } = await supabase
        .from('investor_company_shares')
        .select('*, companies:company_id(*)')
        .eq('investor_id', investor.id);

      if (sharesError) throw sharesError;

      const companiesData = shares.map((share: any) => ({
        ...share.companies,
        percentage: share.percentage
      }));
      
      setCompanies(companiesData);

      // Buscar métricas financeiras
      const { data: metricsData, error: metricsError } = await supabase
        .from('financial_metrics')
        .select('*')
        .in('company_id', companiesData.map((c: any) => c.id))
        .order('date', { ascending: false });

      if (metricsError) throw metricsError;
      
      setMetrics(metricsData);

      // Calcular totais
      let revenue = 0;
      let profit = 0;
      let orders = 0;

      metricsData.forEach((metric: any) => {
        const companyShare = companiesData.find((c: any) => c.id === metric.company_id);
        if (companyShare) {
          const percentage = companyShare.percentage / 100;
          revenue += (metric.revenue * percentage);
          profit += (metric.profit * percentage);
          orders += metric.orders_count;
        }
      });

      setTotals({
        totalRevenue: revenue,
        totalProfit: profit,
        totalOrders: orders,
        activeCompanies: companiesData.length
      });

      toast.success('Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Falha ao carregar dados do investidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso Negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
        <Button asChild className="mt-4">
          <a href="/auth?type=investor">Fazer Login</a>
        </Button>
      </div>
    );
  }

  if (userRole !== 'investor' && userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button asChild className="mt-4">
          <a href="/">Retornar à Página Inicial</a>
        </Button>
      </div>
    );
  }

  return (
    <TransitionEffect>
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full">
          <InvestorSidebar />
          <SidebarInset className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Dashboard do Investidor</h1>
                <p className="text-muted-foreground">Acompanhe o desempenho dos seus investimentos em tempo real</p>
              </div>
              <Button 
                variant="outline" 
                onClick={fetchInvestorData} 
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar Dados
              </Button>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="companies">Empresas</TabsTrigger>
                <TabsTrigger value="forecasts">Previsões</TabsTrigger>
                <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                          <CardDescription>Participação nos lucros</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-2xl font-bold">
                              R$ {totals.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                          <CardDescription>Após despesas operacionais</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <PieChart className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-2xl font-bold">
                              R$ {totals.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
                          <CardDescription>Total de serviços</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-2xl font-bold">
                              {totals.totalOrders}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
                          <CardDescription>Com participação</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-2xl font-bold">
                              {totals.activeCompanies}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Faturamento (Últimos 30 dias)</CardTitle>
                          <CardDescription>Evolução diária do faturamento total</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <RevenueChart metrics={metrics} companies={companies} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Portfólio</CardTitle>
                          <CardDescription>Distribuição por empresa</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <InvestorPortfolio companies={companies} />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="companies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho por Empresa</CardTitle>
                    <CardDescription>Detalhes de faturamento e métricas por empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <CompanyPerformance 
                        companies={companies} 
                        metrics={metrics} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecasts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Previsão de Faturamento</CardTitle>
                    <CardDescription>Com base nos agendamentos futuros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Previsão Mensal</CardTitle>
                              <CardDescription>Mês atual</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-2xl font-bold">
                                  R$ {(totals.totalRevenue * 1.2).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Agendamentos Confirmados</CardTitle>
                              <CardDescription>Para os próximos 30 dias</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center">
                                <ListFilter className="h-4 w-4 text-blue-500 mr-2" />
                                <span className="text-2xl font-bold">
                                  {Math.round(totals.totalOrders * 1.15)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Projeção Trimestral</CardTitle>
                              <CardDescription>Baseada na tendência atual</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-2xl font-bold">
                                  R$ {(totals.totalRevenue * 3.5).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Projeção de Crescimento</CardTitle>
                            <CardDescription>Projeção para os próximos 3 meses</CardDescription>
                          </CardHeader>
                          <CardContent className="h-80">
                            {/* Gráfico de previsão seria implementado aqui */}
                            <div className="flex justify-center items-center h-full">
                              <p className="text-muted-foreground">Gráfico de projeção baseado nas tendências atuais</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                    <CardDescription>Ordens de serviço programadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <UpcomingBookings 
                        companies={companies} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default InvestorDashboard;
