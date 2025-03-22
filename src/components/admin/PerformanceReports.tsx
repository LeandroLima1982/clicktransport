
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Button } from "@/components/ui/button";
import { FilterX, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DashboardStats from './DashboardStats';

const PerformanceReports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('general');
  const [reportsData, setReportsData] = useState<any>({
    companies: [],
    orders: [],
    drivers: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch data
      await Promise.all([
        fetchCompaniesData(),
        fetchOrdersData(),
        fetchDriversData()
      ]);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompaniesData = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('status');
    
    if (error) throw error;
    
    // Count companies by status
    const statusCounts: Record<string, number> = {};
    data?.forEach(company => {
      statusCounts[company.status] = (statusCounts[company.status] || 0) + 1;
    });
    
    const companiesData = Object.keys(statusCounts).map(status => ({
      name: status === 'active' ? 'Ativas' : 
            status === 'pending' ? 'Pendentes' : 
            status === 'inactive' ? 'Inativas' : 
            status === 'suspended' ? 'Suspensas' : status,
      value: statusCounts[status]
    }));
    
    setReportsData(prev => ({ ...prev, companies: companiesData }));
  };

  const fetchOrdersData = async () => {
    const { data, error } = await supabase
      .from('service_orders')
      .select('status, created_at');
    
    if (error) throw error;
    
    // Count orders by status
    const statusCounts: Record<string, number> = {};
    data?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const ordersData = Object.keys(statusCounts).map(status => ({
      name: status === 'pending' ? 'Pendentes' :
            status === 'in_progress' ? 'Em Progresso' :
            status === 'completed' ? 'Concluídas' :
            status === 'cancelled' ? 'Canceladas' : status,
      value: statusCounts[status]
    }));
    
    setReportsData(prev => ({ ...prev, orders: ordersData }));
  };

  const fetchDriversData = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('status');
    
    if (error) throw error;
    
    // Count drivers by status
    const statusCounts: Record<string, number> = {};
    data?.forEach(driver => {
      statusCounts[driver.status] = (statusCounts[driver.status] || 0) + 1;
    });
    
    const driversData = Object.keys(statusCounts).map(status => ({
      name: status === 'active' ? 'Ativos' :
            status === 'inactive' ? 'Inativos' :
            status === 'on_trip' ? 'Em Viagem' : status,
      value: statusCounts[status]
    }));
    
    setReportsData(prev => ({ ...prev, drivers: driversData }));
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
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle>Relatórios de Desempenho</CardTitle>
          <div className="flex mt-2 md:mt-0 space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <FilterX className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="drivers">Motoristas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <DashboardStats />
          </TabsContent>
          
          <TabsContent value="companies">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsData.companies}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportsData.companies.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="drivers">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportsData.drivers}
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceReports;
