
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';

// Sample data (will be replaced with real data from API)
const monthlyData = [
  { name: 'Jan', value: 12 },
  { name: 'Fev', value: 19 },
  { name: 'Mar', value: 15 },
  { name: 'Abr', value: 25 },
  { name: 'Mai', value: 32 },
  { name: 'Jun', value: 28 },
];

const orderStatusData = [
  { name: 'Pendente', value: 5, color: '#FFA500' },
  { name: 'Em Progresso', value: 8, color: '#0088FE' },
  { name: 'Concluído', value: 20, color: '#00C49F' },
  { name: 'Cancelado', value: 3, color: '#FF0000' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data from Supabase
        const companyId = await getCompanyId();
        
        if (companyId) {
          const { data: ordersData } = await supabase
            .from('service_orders')
            .select('*')
            .eq('company_id', companyId);
          
          const { data: driversData } = await supabase
            .from('drivers')
            .select('*')
            .eq('company_id', companyId);
          
          const { data: vehiclesData } = await supabase
            .from('vehicles')
            .select('*')
            .eq('company_id', companyId);
          
          setOrders(ordersData || []);
          setDrivers(driversData || []);
          setVehicles(vehiclesData || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Helper function to get company ID from user ID
  const getCompanyId = async () => {
    if (!user) return null;
    
    try {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      return data?.id || null;
    } catch (error) {
      console.error('Error fetching company ID:', error);
      return null;
    }
  };
  
  const getCompletedOrdersCount = () => {
    return orders.filter(order => order.status === 'completed').length;
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  const getActiveDriversCount = () => {
    return drivers.filter(driver => driver.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ordens Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : orders.length}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10)}% desde o último mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ordens Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : getCompletedOrdersCount()}</div>
            <p className="text-xs text-muted-foreground">
              {orders.length > 0 ? `${Math.round((getCompletedOrdersCount() / orders.length) * 100)}% de conclusão` : '0% de conclusão'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Motoristas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : getActiveDriversCount()}</div>
            <p className="text-xs text-muted-foreground">
              {drivers.length > 0 ? `${Math.round((getActiveDriversCount() / drivers.length) * 100)}% da equipe` : '0% da equipe'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length > 0 ? `${vehicles.filter(v => v.status === 'active').length} ativos` : '0 ativos'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Mensais</CardTitle>
            <CardDescription>Número de ordens por mês</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Número de Ordens" />
              </BarChart>
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
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
