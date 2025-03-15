
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

// Define chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardStats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [ordersByMonth, setOrdersByMonth] = useState<any[]>([]);
  const [companiesByStatus, setCompaniesByStatus] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOrderStats(),
        fetchCompanyStats(),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Falha ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    setOrdersByStatus(statusData);
    setOrdersByMonth(ordersByMonthData);
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
    
    setCompaniesByStatus(companyStatusData);
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
    
    setRecentActivity(recentItems);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço Mensais</CardTitle>
          <CardDescription>Número de ordens por mês</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas empresas e ordens cadastradas</CardDescription>
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

export default DashboardStats;
