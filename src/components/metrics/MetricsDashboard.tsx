
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Filter, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MetricsDashboardProps {
  userRole: 'admin' | 'company';
  entityId?: string; // Company ID when viewing as company
}

interface CompanyMetricsData {
  serviceOrders: { name: string; value: number }[];
  drivers: { name: string; value: number }[];
  vehicles: { name: string; value: number }[];
  ratings: { name: string; value: number }[];
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ userRole, entityId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [metricsData, setMetricsData] = useState<CompanyMetricsData>({
    serviceOrders: [],
    drivers: [],
    vehicles: [],
    ratings: []
  });
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  useEffect(() => {
    fetchMetricsData();
  }, [entityId, period, dateRange]);

  const fetchMetricsData = async () => {
    setIsLoading(true);
    try {
      // Fetch service orders data
      const serviceOrdersData = await fetchServiceOrdersMetrics();
      
      // Fetch drivers data
      const driversData = await fetchDriversMetrics();
      
      // Fetch vehicles data
      const vehiclesData = await fetchVehiclesMetrics();
      
      // Fetch ratings data
      const ratingsData = await fetchRatingsMetrics();
      
      setMetricsData({
        serviceOrders: serviceOrdersData,
        drivers: driversData,
        vehicles: vehiclesData,
        ratings: ratingsData
      });
      
      toast.success('Métricas atualizadas com sucesso');
    } catch (error) {
      console.error('Error fetching metrics data:', error);
      toast.error('Falha ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceOrdersMetrics = async () => {
    let query = supabase
      .from('service_orders')
      .select('status, created_at');
    
    if (userRole === 'company' && entityId) {
      query = query.eq('company_id', entityId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Count orders by status
    const statusCounts: Record<string, number> = {};
    data?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status === 'pending' ? 'Pendentes' :
            status === 'assigned' ? 'Atribuídas' :
            status === 'in_progress' ? 'Em Progresso' :
            status === 'completed' ? 'Concluídas' :
            status === 'cancelled' ? 'Canceladas' : status,
      value: statusCounts[status]
    }));
  };

  const fetchDriversMetrics = async () => {
    let query = supabase
      .from('drivers')
      .select('status, created_at');
    
    if (userRole === 'company' && entityId) {
      query = query.eq('company_id', entityId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Count drivers by status
    const statusCounts: Record<string, number> = {};
    data?.forEach(driver => {
      statusCounts[driver.status] = (statusCounts[driver.status] || 0) + 1;
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status === 'active' ? 'Ativos' :
            status === 'inactive' ? 'Inativos' :
            status === 'on_trip' ? 'Em Viagem' : status,
      value: statusCounts[status]
    }));
  };

  const fetchVehiclesMetrics = async () => {
    let query = supabase
      .from('vehicles')
      .select('status, type');
    
    if (userRole === 'company' && entityId) {
      query = query.eq('company_id', entityId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Count vehicles by type
    const typeCounts: Record<string, number> = {};
    data?.forEach(vehicle => {
      typeCounts[vehicle.type] = (typeCounts[vehicle.type] || 0) + 1;
    });
    
    return Object.keys(typeCounts).map(type => ({
      name: type === 'sedan' ? 'Sedan' :
            type === 'suv' ? 'SUV' :
            type === 'van' ? 'Van' :
            type === 'bus' ? 'Ônibus' : type,
      value: typeCounts[type]
    }));
  };

  const fetchRatingsMetrics = async () => {
    // For ratings, we need to join with drivers to get company_id
    let query = supabase
      .from('driver_ratings')
      .select('rating, driver_id, drivers!inner(company_id)');
    
    if (userRole === 'company' && entityId) {
      query = query.eq('drivers.company_id', entityId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Count ratings by star
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data?.forEach(rating => {
      const ratingValue = Math.min(Math.max(Math.round(rating.rating), 1), 5);
      ratingCounts[ratingValue as keyof typeof ratingCounts] += 1;
    });
    
    return Object.entries(ratingCounts).map(([rating, count]) => ({
      name: `${rating} ${rating === '1' ? 'Estrela' : 'Estrelas'}`,
      value: count
    }));
  };

  // Define chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle>Dashboard de Métricas</CardTitle>
            <CardDescription>
              {userRole === 'admin' 
                ? 'Visão geral das métricas do sistema'
                : 'Métricas de desempenho da sua empresa'}
            </CardDescription>
          </div>
          <div className="flex mt-2 md:mt-0 space-x-2">
            <Button variant="outline" size="sm" onClick={fetchMetricsData} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="drivers">Motoristas</TabsTrigger>
            <TabsTrigger value="ratings">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ordens de Serviço</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricsData.serviceOrders}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metricsData.serviceOrders.map((entry, index) => (
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
                  <CardTitle className="text-base">Motoristas por Status</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsData.drivers}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Motoristas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Análise de Ordens de Serviço</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsData.serviceOrders}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
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
          
          <TabsContent value="drivers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Motoristas por Status</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metricsData.drivers}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Motoristas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Veículos por Tipo</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metricsData.vehicles}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metricsData.vehicles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição de Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsData.ratings}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MetricsDashboard;
