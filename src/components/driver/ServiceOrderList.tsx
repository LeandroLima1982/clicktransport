
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import AssignedOrderList from './AssignedOrderList';
import AvailableOrderList from './AvailableOrderList';
import { useServiceOrders } from './hooks/useServiceOrders';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ServiceOrderList: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  
  const { 
    orders, 
    isLoading, 
    error,
    handleAcceptOrder, 
    handleRejectOrder, 
    handleUpdateStatus,
    refreshOrders
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
        console.log('ID do motorista encontrado:', data.id);
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

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const isLoadingAny = isLoading || isLoadingDriver;

  const handleRefresh = () => {
    refreshOrders();
    toast.success('Lista atualizada');
  };

  if (isLoadingAny) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando ordens de serviço...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ordens de Serviço</h2>
        <button 
          onClick={handleRefresh}
          className="text-sm text-primary hover:underline"
        >
          Atualizar
        </button>
      </div>
      
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
