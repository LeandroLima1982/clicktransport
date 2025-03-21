import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderStats {
  date: string;
  completed: number;
  cancelled: number;
  pending: number;
  in_progress: number;
}

interface DriverStats {
  driver_name: string;
  completed_orders: number;
  total_distance: number;
  average_rating: number;
}

const PerformanceReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const [orderStats, setOrderStats] = useState<OrderStats[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchCompanies();
    fetchData();
  }, [dateRange, selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies data');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format dates for query
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Build query for order stats
      let query = supabase
        .from('service_orders')
        .select('*')
        .gte('created_at', `${fromDate}T00:00:00`)
        .lte('created_at', `${toDate}T23:59:59`);
      
      // Add company filter if not "all"
      if (selectedCompany !== 'all') {
        query = query.eq('company_id', selectedCompany);
      }
      
      const { data: ordersData, error: ordersError } = await query;
      
      if (ordersError) throw ordersError;
      
      // Process order data by date
      const ordersByDate = processOrdersByDate(ordersData || []);
      setOrderStats(ordersByDate);
      
      // Fetch driver stats
      let driverQuery = supabase
        .from('drivers')
        .select(`
          id,
          name,
          service_orders!driver_id(
            id,
            status,
            created_at
          )
        `)
        .eq('status', 'active');
      
      // Add company filter for drivers if not "all"
      if (selectedCompany !== 'all') {
        driverQuery = driverQuery.eq('company_id', selectedCompany);
      }
      
      const { data: driversData, error: driversError } = await driverQuery;
      
      if (driversError) throw driversError;
      
      // Process driver stats
      const processedDriverStats = processDriverStats(driversData || []);
      setDriverStats(processedDriverStats);
      
    } catch (error: any) {
      console.error('Error fetching performance data:', error);
      setError(error.message || 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const processOrdersByDate = (orders: any[]): OrderStats[] => {
    // Group orders by date and status
    const ordersByDate: Record<string, { completed: number, cancelled: number, pending: number, in_progress: number }> = {};
    
    orders.forEach(order => {
      const date = format(new Date(order.created_at), 'yyyy-MM-dd');
      
      if (!ordersByDate[date]) {
        ordersByDate[date] = {
          completed: 0,
          cancelled: 0,
          pending: 0,
          in_progress: 0
        };
      }
      
      // Increment the appropriate status counter
      if (order.status === 'completed') {
        ordersByDate[date].completed += 1;
      } else if (order.status === 'cancelled') {
        ordersByDate[date].cancelled += 1;
      } else if (order.status === 'pending') {
        ordersByDate[date].pending += 1;
      } else if (order.status === 'in_progress') {
        ordersByDate[date].in_progress += 1;
      }
    });
    
    // Convert to array format for chart
    return Object.keys(ordersByDate).map(date => ({
      date,
      ...ordersByDate[date]
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processDriverStats = (drivers: any[]): DriverStats[] => {
    return drivers.map(driver => {
      const completedOrders = driver.service_orders.filter((order: any) => 
        order.status === 'completed'
      ).length;
      
      // In a real app, you would calculate these from actual data
      // Here we're using placeholder calculations
      const totalDistance = completedOrders * Math.floor(Math.random() * 50 + 10); // Random distance per order
      const averageRating = (3 + Math.random() * 2).toFixed(1); // Random rating between 3-5
      
      return {
        driver_name: driver.name,
        completed_orders: completedOrders,
        total_distance: totalDistance,
        average_rating: parseFloat(averageRating)
      };
    }).sort((a, b) => b.completed_orders - a.completed_orders);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Performance Reports</CardTitle>
        <div className="flex items-center gap-4">
          <Select
            value={selectedCompany}
            onValueChange={setSelectedCompany}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="orders">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Orders by Status</TabsTrigger>
            <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <div className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading order statistics...</p>
                </div>
              ) : orderStats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p>No order data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" />
                    <Bar dataKey="in_progress" name="In Progress" fill="#3b82f6" />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="drivers">
            <div className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading driver statistics...</p>
                </div>
              ) : driverStats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p>No driver data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={driverStats} 
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="driver_name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed_orders" name="Completed Orders" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceReports;
