
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverDashboard from './DriverDashboard';
import ServiceOrderList from './ServiceOrderList';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import TripHistory from './TripHistory';
import { useServiceOrders } from './hooks/useServiceOrders';

const DriverPanel: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  
  const { 
    orders, 
    isLoading: isLoadingOrders, 
    handleUpdateStatus
  } = useServiceOrders(driverId);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  const fetchDriverId = async () => {
    setIsLoadingDriver(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar ID do motorista:', error);
        toast.error('Erro ao buscar perfil do motorista');
        return;
      }

      if (data) {
        setDriverId(data.id);
      } else {
        toast.error('Perfil de motorista não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar ID do motorista:', error);
      toast.error('Erro ao carregar perfil do motorista');
    } finally {
      setIsLoadingDriver(false);
    }
  };

  const isLoading = isLoadingDriver || isLoadingOrders;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Ordens Ativas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DriverDashboard />
          </TabsContent>
          
          <TabsContent value="orders">
            <h2 className="text-xl font-semibold mb-4">Ordens de Serviço Ativas</h2>
            {orders && orders.length > 0 ? (
              <ServiceOrderList 
                orders={orders}
                driverId={driverId}
                handleUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <p className="text-muted-foreground">Nenhuma ordem de serviço ativa no momento.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <TripHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DriverPanel;
