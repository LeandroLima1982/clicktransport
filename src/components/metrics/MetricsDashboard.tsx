
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, AreaChart, PieChart, Pie, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Calendar, TrendingUp, Users } from 'lucide-react';

interface MetricsDashboardProps {
  userRole: string;
  entityId?: string;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ userRole, entityId }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    orders: {
      weeklyData: [],
      monthlyData: [],
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      inProgressOrders: 0
    },
    drivers: {
      totalDrivers: 0,
      activeDrivers: 0,
      driverRatings: [],
      driversPerCompany: []
    },
    vehicles: {
      totalVehicles: 0,
      vehiclesByCategory: [],
      vehicleUtilization: []
    },
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: [],
      revenueByCompany: []
    }
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Fetch different metrics based on role and entity
        const ordersData = await fetchOrderMetrics(userRole, entityId);
        const driversData = await fetchDriverMetrics(userRole, entityId);
        const vehiclesData = await fetchVehicleMetrics(userRole, entityId);
        const revenueData = await fetchRevenueMetrics(userRole, entityId);

        setMetrics({
          orders: ordersData,
          drivers: driversData,
          vehicles: vehiclesData,
          revenue: revenueData
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [userRole, entityId]);

  // Helper functions to fetch different metrics
  const fetchOrderMetrics = async (role: string, id?: string) => {
    // Demo data - in a real app, this would fetch from your database
    const weeklyOrderData = [
      { name: 'Seg', orders: 12 },
      { name: 'Ter', orders: 19 },
      { name: 'Qua', orders: 15 },
      { name: 'Qui', orders: 22 },
      { name: 'Sex', orders: 30 },
      { name: 'Sab', orders: 18 },
      { name: 'Dom', orders: 8 },
    ];

    const monthlyOrderData = [
      { name: 'Jan', orders: 65 },
      { name: 'Fev', orders: 78 },
      { name: 'Mar', orders: 90 },
      { name: 'Abr', orders: 81 },
      { name: 'Mai', orders: 93 },
      { name: 'Jun', orders: 102 },
      { name: 'Jul', orders: 110 },
      { name: 'Ago', orders: 95 },
      { name: 'Set', orders: 89 },
      { name: 'Out', orders: 105 },
      { name: 'Nov', orders: 120 },
      { name: 'Dez', orders: 130 },
    ];

    // For a real application, you'd fetch this data from Supabase
    // For company users, add a filter for their company ID
    let query = supabase.from('service_orders').select('*', { count: 'exact' });
    
    if (role === 'company' && id) {
      query = query.eq('company_id', id);
    }

    const { count } = await query.select('status');
    
    // Count orders by status
    const { data: statusCounts } = await supabase.rpc('count_orders_by_status', 
      role === 'company' && id ? { company_filter: id } : {});

    const completedOrders = statusCounts?.find(item => item.status === 'completed')?.count || 0;
    const cancelledOrders = statusCounts?.find(item => item.status === 'cancelled')?.count || 0;
    const inProgressOrders = (count || 0) - (completedOrders + cancelledOrders);

    return {
      weeklyData: weeklyOrderData,
      monthlyData: monthlyOrderData,
      totalOrders: count || 0,
      completedOrders,
      cancelledOrders,
      inProgressOrders
    };
  };

  const fetchDriverMetrics = async (role: string, id?: string) => {
    // Demo data for driver ratings
    const driverRatingsData = [
      { name: '5 estrelas', value: 68 },
      { name: '4 estrelas', value: 22 },
      { name: '3 estrelas', value: 7 },
      { name: '2 estrelas', value: 2 },
      { name: '1 estrela', value: 1 },
    ];

    // Demo data for drivers per company
    const driversPerCompanyData = [
      { name: 'RapidApp', drivers: 35 },
      { name: 'FastCar', drivers: 28 },
      { name: 'SkyTaxi', drivers: 42 },
      { name: 'CityCar', drivers: 30 },
      { name: 'ValleyRide', drivers: 22 },
    ];

    // For a real application, you would fetch this from Supabase
    let query = supabase.from('drivers').select('*', { count: 'exact' });
    
    if (role === 'company' && id) {
      query = query.eq('company_id', id);
    }
    
    const { count: totalDrivers } = await query;
    const { count: activeDrivers } = await query.eq('status', 'active');

    return {
      totalDrivers: totalDrivers || 0,
      activeDrivers: activeDrivers || 0,
      driverRatings: driverRatingsData,
      driversPerCompany: role === 'admin' ? driversPerCompanyData : []
    };
  };

  const fetchVehicleMetrics = async (role: string, id?: string) => {
    // Demo data for vehicles by category
    const vehiclesByCategoryData = [
      { name: 'Econômico', vehicles: 45 },
      { name: 'Conforto', vehicles: 30 },
      { name: 'Luxo', vehicles: 15 },
      { name: 'Van', vehicles: 10 },
    ];

    // Demo data for vehicle utilization
    const vehicleUtilizationData = [
      { name: 'Seg', utilization: 75 },
      { name: 'Ter', utilization: 82 },
      { name: 'Qua', utilization: 78 },
      { name: 'Qui', utilization: 85 },
      { name: 'Sex', utilization: 90 },
      { name: 'Sab', utilization: 95 },
      { name: 'Dom', utilization: 65 },
    ];

    // For a real application, you would fetch this from Supabase
    let query = supabase.from('vehicles').select('*', { count: 'exact' });
    
    if (role === 'company' && id) {
      query = query.eq('company_id', id);
    }
    
    const { count: totalVehicles } = await query;

    return {
      totalVehicles: totalVehicles || 0,
      vehiclesByCategory: vehiclesByCategoryData,
      vehicleUtilization: vehicleUtilizationData
    };
  };

  const fetchRevenueMetrics = async (role: string, id?: string) => {
    // This would only be shown to admins or company owners
    // Demo data for monthly revenue
    const monthlyRevenueData = [
      { name: 'Jan', revenue: 25000 },
      { name: 'Fev', revenue: 30000 },
      { name: 'Mar', revenue: 32000 },
      { name: 'Abr', revenue: 28000 },
      { name: 'Mai', revenue: 33000 },
      { name: 'Jun', revenue: 35000 },
      { name: 'Jul', revenue: 38000 },
      { name: 'Ago', revenue: 36000 },
      { name: 'Set', revenue: 32000 },
      { name: 'Out', revenue: 34000 },
      { name: 'Nov', revenue: 40000 },
      { name: 'Dez', revenue: 42000 },
    ];

    // Demo data for revenue by company
    const revenueByCompanyData = [
      { name: 'RapidApp', revenue: 120000 },
      { name: 'FastCar', revenue: 85000 },
      { name: 'SkyTaxi', revenue: 140000 },
      { name: 'CityCar', revenue: 95000 },
      { name: 'ValleyRide', revenue: 78000 },
    ];

    // For a real application, this would calculate from completed orders
    const totalRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);

    return {
      totalRevenue,
      monthlyRevenue: monthlyRevenueData,
      revenueByCompany: role === 'admin' ? revenueByCompanyData : []
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Ordens</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Motoristas</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Veículos</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Receita</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.orders.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metrics.orders.completedOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{metrics.orders.cancelledOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{metrics.orders.inProgressOrders}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="weekly">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">Semanal</TabsTrigger>
                  <TabsTrigger value="monthly">Mensal</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.orders.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#3b82f6" name="Pedidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="monthly">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.orders.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Pedidos" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Motoristas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.drivers.totalDrivers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Motoristas Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metrics.drivers.activeDrivers}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Avaliações de Motoristas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.drivers.driverRatings}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.drivers.driverRatings.map((entry, index) => (
                        <Pie key={`cell-${index}`} fill={['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {userRole === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Motoristas por Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.drivers.driversPerCompany}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="drivers" fill="#8884d8" name="Motoristas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.vehicles.totalVehicles}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Veículos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.vehicles.vehiclesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vehicles" fill="#82ca9d" name="Veículos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilização de Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.vehicles.vehicleUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="utilization" stroke="#8884d8" fill="#8884d8" name="Utilização (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {metrics.revenue.totalRevenue.toLocaleString('pt-BR')}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics.revenue.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="Receita (R$)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Receita por Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.revenue.revenueByCompany}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Receita (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDashboard;
