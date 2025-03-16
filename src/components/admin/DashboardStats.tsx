
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardStats: React.FC = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchAllStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { runDiagnostics, diagnostics, diagnosticsLoading } = useCompanyQueue();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      runDiagnostics();
      toast.success('Dados atualizados com sucesso');
    } catch (error) {
      toast.error('Falha ao atualizar os dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  async function fetchAllStats() {
    try {
      // Fetch all needed data in parallel
      const [ordersResult, companiesResult, driversResult, recentActivityResult] = await Promise.all([
        fetchOrderStats(),
        fetchCompanyStats(),
        fetchDriverStats(),
        fetchRecentActivity()
      ]);
      
      return {
        ordersByStatus: ordersResult.statusData || [],
        ordersByMonth: ordersResult.monthlyData || [],
        companiesByStatus: companiesResult || [],
        driverStats: driversResult || {},
        recentActivity: recentActivityResult || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Falha ao carregar estatísticas');
      throw error;
    }
  }

  const fetchOrderStats = async () => {
    // Fetch service orders
    const { data: orders, error } = await supabase
      .from('service_orders')
      .select('*');
    
    if (error) throw error;
    
    // Process data for status chart
    const statusCounts: Record<string, number> = {};
    orders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const statusData = Object.keys(statusCounts).map(status => ({
      name: translateOrderStatus(status),
      value: statusCounts[status],
      color: getOrderStatusColor(status)
    }));
    
    // Process data for monthly chart
    // Group by month using created_at field
    const now = new Date();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      return { month: d.getMonth(), year: d.getFullYear() };
    }).reverse();
    
    const ordersByMonthData = lastSixMonths.map(({ month, year }) => {
      const count = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
      }).length || 0;
      
      return {
        name: `${monthNames[month]}/${year.toString().slice(2)}`,
        value: count
      };
    });
    
    return { statusData, monthlyData: ordersByMonthData };
  };

  const fetchCompanyStats = async () => {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    
    // Process data for company status chart
    const statusCounts: Record<string, number> = {};
    companies?.forEach(company => {
      statusCounts[company.status] = (statusCounts[company.status] || 0) + 1;
    });
    
    const companyStatusData = Object.keys(statusCounts).map(status => ({
      name: translateCompanyStatus(status),
      value: statusCounts[status],
      color: getCompanyStatusColor(status)
    }));
    
    return companyStatusData;
  };
  
  const fetchDriverStats = async () => {
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('*');
    
    if (error) throw error;
    
    // Process data for driver stats
    const statusCounts: Record<string, number> = {};
    drivers?.forEach(driver => {
      statusCounts[driver.status] = (statusCounts[driver.status] || 0) + 1;
    });
    
    // Orders completed by each driver
    const { data: ordersByDriver } = await supabase
      .from('service_orders')
      .select('driver_id')
      .eq('status', 'completed');
    
    // Count orders per driver
    const driverOrderCounts: Record<string, number> = {};
    ordersByDriver?.forEach(order => {
      if (order.driver_id) {
        driverOrderCounts[order.driver_id] = (driverOrderCounts[order.driver_id] || 0) + 1;
      }
    });
    
    return {
      statusDistribution: statusCounts,
      ordersByDriver: driverOrderCounts,
      totalDrivers: drivers?.length || 0,
      activeDrivers: drivers?.filter(d => d.status === 'active').length || 0
    };
  };

  const fetchRecentActivity = async () => {
    // Fetch recent companies
    const { data: recentCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('name, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (companiesError) throw companiesError;
    
    // Fetch recent orders
    const { data: recentOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('origin, destination, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) throw ordersError;
    
    // Combine and sort by date
    const recentItems = [
      ...(recentCompanies?.map(company => ({
        type: 'company',
        name: company.name,
        date: company.created_at,
        status: company.status
      })) || []),
      ...(recentOrders?.map(order => ({
        type: 'order',
        name: `${order.origin} → ${order.destination}`,
        date: order.created_at,
        status: order.status
      })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    return recentItems;
  };

  const translateOrderStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const translateCompanyStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativa',
      'pending': 'Pendente',
      'inactive': 'Inativa',
      'suspended': 'Suspensa'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': '#FFBB28',
      'in_progress': '#0088FE',
      'completed': '#00C49F',
      'cancelled': '#FF8042'
    };
    return colorMap[status] || '#8884d8';
  };

  const getCompanyStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': '#00C49F',
      'pending': '#FFBB28',
      'inactive': '#8884d8',
      'suspended': '#FF8042'
    };
    return colorMap[status] || '#8884d8';
  };

  const getActivityStatusBadge = (item: any) => {
    let className = '';
    let statusText = '';
    
    if (item.type === 'company') {
      switch (item.status) {
        case 'active':
          className = 'bg-green-100 text-green-800';
          statusText = 'Ativa';
          break;
        case 'pending':
          className = 'bg-yellow-100 text-yellow-800';
          statusText = 'Pendente';
          break;
        case 'inactive':
          className = 'bg-gray-100 text-gray-800';
          statusText = 'Inativa';
          break;
        case 'suspended':
          className = 'bg-red-100 text-red-800';
          statusText = 'Suspensa';
          break;
      }
    } else {
      switch (item.status) {
        case 'pending':
          className = 'bg-yellow-100 text-yellow-800';
          statusText = 'Pendente';
          break;
        case 'in_progress':
          className = 'bg-blue-100 text-blue-800';
          statusText = 'Em Progresso';
          break;
        case 'completed':
          className = 'bg-green-100 text-green-800';
          statusText = 'Concluída';
          break;
        case 'cancelled':
          className = 'bg-red-100 text-red-800';
          statusText = 'Cancelada';
          break;
      }
    }
    
    return <Badge className={className}>{statusText}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estatísticas da Plataforma</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Mensais</CardTitle>
            <CardDescription>Número de ordens por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ordersByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Número de Ordens" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status das Ordens</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas por Status</CardTitle>
            <CardDescription>Distribuição de empresas por status</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.companiesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.companiesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas empresas e ordens cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type === 'company' ? 'Empresa' : 'Ordem'} • {formatDate(item.date)}
                      </p>
                    </div>
                    {getActivityStatusBadge(item)}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {diagnostics && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico da Fila de Empresas</CardTitle>
            <CardDescription>Status da alocação de ordens entre empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Total de Empresas</h3>
                  <p className="text-xl font-bold">{diagnostics?.queue_status?.total_companies || 0}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Empresas Ativas</h3>
                  <p className="text-xl font-bold">{diagnostics?.queue_status?.active_companies || 0}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-1">Posições Inválidas</h3>
                  <p className="text-xl font-bold">{
                    (diagnostics?.queue_status?.null_queue_position_count || 0) + 
                    (diagnostics?.queue_status?.zero_queue_position_count || 0)
                  }</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Empresas com mais ordens:</h3>
              {diagnostics?.companies?.slice(0, 5)
                .sort((a, b) => (b.order_count as number || 0) - (a.order_count as number || 0))
                .map((company, idx) => (
                <div key={company.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <span className="font-medium">{company.name}</span>
                    <div className="text-sm text-muted-foreground">
                      Posição: {company.queue_position || 'N/A'} • Ordens: {company.order_count}
                    </div>
                  </div>
                  <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                    {translateCompanyStatus(company.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;
