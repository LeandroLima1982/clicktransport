
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MetricsDashboardProps {
  userRole: 'admin' | 'company' | 'driver';
  entityId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ userRole, entityId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    ordersByStatus: [] as {name: string; value: number}[],
    ordersTrend: [] as {date: string; orders: number}[],
    driversStatus: [] as {name: string; value: number}[],
    ratings: [] as {rating: number; count: number}[],
    averageRating: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    activeDrivers: 0,
    totalDrivers: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, [userRole, entityId]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Orders by status
      const { data: orderStatusData, error: orderStatusError } = await supabase
        .from('service_orders')
        .select('status, count')
        .select()
        .eq(userRole === 'company' ? 'company_id' : '1', userRole === 'company' ? entityId : '1')
        .or('1.eq.1', { foreignTable: 'company_id' })
        .count()
        .or('status.eq.pending,status.eq.assigned,status.eq.in_progress,status.eq.completed,status.eq.cancelled')
        .group('status');

      if (orderStatusError) throw orderStatusError;

      // Order trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: orderTrendsData, error: orderTrendsError } = await supabase
        .from('service_orders')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq(userRole === 'company' ? 'company_id' : '1', userRole === 'company' ? entityId : '1')
        .or('1.eq.1', { foreignTable: 'company_id' });

      if (orderTrendsError) throw orderTrendsError;

      // Drivers status
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('status, count')
        .eq(userRole === 'company' ? 'company_id' : '1', userRole === 'company' ? entityId : '1')
        .or('1.eq.1', { foreignTable: 'company_id' })
        .count()
        .group('status');

      if (driversError) throw driversError;

      // Ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('service_orders')
        .select('driver_rating')
        .not('driver_rating', 'is', null)
        .eq(userRole === 'company' ? 'company_id' : '1', userRole === 'company' ? entityId : '1')
        .or('1.eq.1', { foreignTable: 'company_id' });

      if (ratingsError) throw ratingsError;

      // Process data
      const ordersByStatus = orderStatusData?.map(item => ({
        name: formatStatusName(item.status),
        value: item.count || 0
      })) || [];

      // Process order trends
      const ordersByDate = orderTrendsData ? processOrderTrends(orderTrendsData) : [];

      // Process drivers status
      const driversStatus = driversData?.map(item => ({
        name: formatDriverStatusName(item.status),
        value: item.count || 0
      })) || [];

      // Process ratings
      const ratingCounts = Array(5).fill(0);
      let totalRating = 0;
      
      ratingsData?.forEach(order => {
        if (order.driver_rating) {
          const rating = Math.floor(order.driver_rating);
          if (rating >= 1 && rating <= 5) {
            ratingCounts[rating - 1]++;
            totalRating += order.driver_rating;
          }
        }
      });

      const ratingData = ratingCounts.map((count, index) => ({
        rating: index + 1,
        count
      }));

      const averageRating = ratingsData?.length ? totalRating / ratingsData.length : 0;
      
      // Set metrics
      setMetrics({
        ordersByStatus,
        ordersTrend: ordersByDate,
        driversStatus,
        ratings: ratingData,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalOrders: orderStatusData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0,
        completedOrders: orderStatusData?.find(item => item.status === 'completed')?.count || 0,
        cancelledOrders: orderStatusData?.find(item => item.status === 'cancelled')?.count || 0,
        activeDrivers: driversData?.find(item => item.status === 'active')?.count || 0,
        totalDrivers: driversData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0
      });

      toast.success('Métricas atualizadas com sucesso');
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  const processOrderTrends = (orders: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const orderCounts: Record<string, number> = {};
    last30Days.forEach(date => {
      orderCounts[date] = 0;
    });

    orders.forEach(order => {
      const orderDate = order.created_at.split('T')[0];
      if (orderCounts[orderDate] !== undefined) {
        orderCounts[orderDate]++;
      }
    });

    return Object.entries(orderCounts).map(([date, orders]) => ({
      date: formatDate(date),
      orders
    }));
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const formatStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'assigned': 'Atribuído',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const formatDriverStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'on_trip': 'Em Viagem',
      'pending_approval': 'Pendente'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Métricas de Desempenho</h2>
        <Button
          variant="outline"
          onClick={fetchMetrics}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando métricas...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total de Ordens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalOrders}</div>
                <p className="text-sm text-muted-foreground">Todas as ordens de serviço</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{metrics.completedOrders}</div>
                <p className="text-sm text-muted-foreground">
                  {metrics.totalOrders > 0 
                    ? `${((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1)}% do total`
                    : 'Nenhuma ordem registrada'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Canceladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{metrics.cancelledOrders}</div>
                <p className="text-sm text-muted-foreground">
                  {metrics.totalOrders > 0 
                    ? `${((metrics.cancelledOrders / metrics.totalOrders) * 100).toFixed(1)}% do total`
                    : 'Nenhuma ordem registrada'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avaliação Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{metrics.averageRating}</div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(metrics.averageRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : i < metrics.averageRating
                          ? 'text-yellow-500 fill-yellow-500 opacity-50'
                          : 'text-gray-300 fill-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="orders">Ordens</TabsTrigger>
              <TabsTrigger value="drivers">Motoristas</TabsTrigger>
              <TabsTrigger value="ratings">Avaliações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status das Ordens</CardTitle>
                    <CardDescription>Distribuição por status</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tendência de Ordens</CardTitle>
                    <CardDescription>Últimos 30 dias</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics.ordersTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="orders" stroke="#8884d8" name="Ordens" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ordens por Status</CardTitle>
                  <CardDescription>Distribuição de ordens por status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.ordersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drivers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Motoristas Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metrics.activeDrivers}</div>
                    <p className="text-sm text-muted-foreground">
                      {metrics.totalDrivers > 0 
                        ? `${((metrics.activeDrivers / metrics.totalDrivers) * 100).toFixed(1)}% do total`
                        : 'Nenhum motorista registrado'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total de Motoristas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metrics.totalDrivers}</div>
                    <p className="text-sm text-muted-foreground">Total de motoristas registrados</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Motoristas</CardTitle>
                  <CardDescription>Distribuição por status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.driversStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {metrics.driversStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ratings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Avaliações</CardTitle>
                  <CardDescription>Quantidade de avaliações por estrelas</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.ratings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Quantidade" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MetricsDashboard;
