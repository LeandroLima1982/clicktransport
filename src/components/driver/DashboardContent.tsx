
import React from 'react';
import DriverDashboard from './DriverDashboard';
import ServiceOrderList from './ServiceOrderList';
import { useServiceOrders } from './hooks/useServiceOrders';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  
  const { 
    orders, 
    isLoading, 
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

  if (isLoadingDriver || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DriverDashboard />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Ordens de Serviço Atribuídas</h2>
        {orders && orders.length > 0 ? (
          <ServiceOrderList 
            orders={orders}
            driverId={driverId}
            handleUpdateStatus={handleUpdateStatus}
          />
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">Nenhuma ordem de serviço atribuída no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
