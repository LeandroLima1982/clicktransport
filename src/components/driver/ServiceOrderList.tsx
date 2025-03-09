
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import AssignedOrderList from './AssignedOrderList';
import AvailableOrderList from './AvailableOrderList';
import { useServiceOrders } from './hooks/useServiceOrders';
import { toast } from 'sonner';

const ServiceOrderList: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  
  const { 
    orders, 
    isLoading, 
    handleAcceptOrder, 
    handleRejectOrder, 
    handleUpdateStatus 
  } = useServiceOrders(driverId);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  const fetchDriverId = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar ID do motorista:', error);
        return;
      }

      if (data) {
        setDriverId(data.id);
        console.log('ID do motorista encontrado:', data.id);
      } else {
        toast.error('Perfil de motorista não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar ID do motorista:', error);
      toast.error('Erro ao carregar perfil do motorista');
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando ordens de serviço...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assigned">
        <TabsList>
          <TabsTrigger value="assigned">Minhas Corridas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned" className="mt-4">
          <AssignedOrderList 
            orders={orders} 
            driverId={driverId}
            handleUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          <AvailableOrderList 
            orders={orders}
            driverId={driverId}
            handleAcceptOrder={handleAcceptOrder}
            handleRejectOrder={handleRejectOrder}
            handleUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceOrderList;
