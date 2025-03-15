
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboardStats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [ordersByMonth, setOrdersByMonth] = useState<any[]>([]);
  const [companiesByStatus, setCompaniesByStatus] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await Promise.all([
        fetchOrderStats(),
        fetchCompanyStats(),
        fetchRecentActivity()
      ]);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setErrorMessage('Falha ao carregar estatísticas. Tente novamente mais tarde.');
      toast.error('Falha ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // Fetch service orders
      const { data: orders, error } = await supabase
        .from('service_orders')
        .select('*');
      
      if (error) throw error;
      
      if (!orders || orders.length === 0) {
        setOrdersByStatus([]);
        setOrdersByMonth([]);
        return;
      }
      
      // Process data for status chart
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
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
        const count = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        }).length || 0;
        
        return {
          name: `${monthNames[month]}/${year.toString().slice(2)}`,
          value: count
        };
      });
      
      setOrdersByStatus(statusData);
      setOrdersByMonth(ordersByMonthData);
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
      toast.error('Falha ao carregar estatísticas de ordens');
      throw error;
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      if (!companies || companies.length === 0) {
        setCompaniesByStatus([]);
        return;
      }
      
      // Process data for company status chart
      const statusCounts: Record<string, number> = {};
      companies.forEach(company => {
        statusCounts[company.status] = (statusCounts[company.status] || 0) + 1;
      });
      
      const companyStatusData = Object.keys(statusCounts).map(status => ({
        name: translateCompanyStatus(status),
        value: statusCounts[status],
        color: getCompanyStatusColor(status)
      }));
      
      setCompaniesByStatus(companyStatusData);
    } catch (error: any) {
      console.error('Error fetching company stats:', error);
      toast.error('Falha ao carregar estatísticas de empresas');
      throw error;
    }
  };

  const fetchRecentActivity = async () => {
    try {
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
      
      setRecentActivity(recentItems);
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      // Don't throw here - we'll still show other stats even if this fails
      setRecentActivity([]);
    }
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
        default:
          className = 'bg-gray-100 text-gray-800';
          statusText = item.status;
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
        default:
          className = 'bg-gray-100 text-gray-800';
          statusText = item.status;
      }
    }
    
    return <Badge className={className}>{statusText}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ordens de Serviço Mensais</CardTitle>
            <CardDescription>Número de ordens por mês</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-80">
          {ordersByMonth.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Número de Ordens" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Status das Ordens</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-80">
          {ordersByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Empresas por Status</CardTitle>
            <CardDescription>Distribuição de empresas por status</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="h-80">
          {companiesByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companiesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companiesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas empresas e ordens cadastradas</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
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
  );
};

export default AdminDashboardStats;
