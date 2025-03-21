import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabaseClient';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDriverStats();
    }
  }, [user]);

  const fetchDriverStats = async () => {
    setIsLoading(true);
    try {
      // Get driver ID from user ID
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (driverData) {
        const driverId = driverData.id;

        // Get pending orders count
        const { count: pendingCount } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverId)
          .in('status', ['assigned', 'in_progress']);

        // Get completed orders count
        const { count: completedCount } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .eq('driver_id', driverId)
          .eq('status', 'completed');

        // For demo purposes, we'll use some placeholder values for earnings and rating
        // In a real application, these would come from the database
        const totalEarnings = completedCount * 150; // Assuming R$150 per completed order
        const averageRating = 4.8; // Placeholder rating

        setStats({
          pendingOrders: pendingCount || 0,
          completedOrders: completedCount || 0,
          totalEarnings,
          averageRating
        });
      }
    } catch (error) {
      console.error('Error fetching driver stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ordens Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Corridas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="text-yellow-500 text-sm mt-1">★★★★★</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;
