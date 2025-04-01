
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceOrder as ServiceOrderType } from '@/types/serviceOrder';
import { toast } from 'sonner';
import { playNotificationSound } from '@/services/notifications/notificationService';
import { updateOrderStatus } from '@/services/booking/bookingService';

export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver_id: string | null;
  company_id: string;
  company_name?: string | null;
  vehicle_id: string | null;
  notes: string | null;
}

export const useServiceOrders = (driverId: string | null) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!driverId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: ordersError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies:company_id(name)
        `)
        .or(`driver_id.eq.${driverId},and(driver_id.is.null,status.eq.pending)`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const formattedOrders = data?.map(order => ({
        ...order,
        company_name: order.companies?.name || null,
        status: order.status as ServiceOrder['status']
      })) as ServiceOrder[];

      setOrders(formattedOrders || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching service orders:', err);
      setError(err.message || 'Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel('driver_service_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          console.log('Service order change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && 
              payload.old.driver_id !== payload.new.driver_id && 
              payload.new.driver_id === driverId) {
            playNotificationSound();
            toast.success('Nova corrida atribuída!', { 
              description: `Origem: ${payload.new.origin}`,
              duration: 6000
            });
          }

          fetchOrders();
        }
      )
      .subscribe();

    const pendingChannel = supabase
      .channel('pending_service_orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'service_orders',
          filter: `status=eq.pending,driver_id=is.null`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(pendingChannel);
    };
  }, [driverId, fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!driverId) {
      setError('Você precisa estar logado como motorista');
      return Promise.reject('Motorista não autenticado');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId, 
          status: 'assigned' as const
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      const { error: driverUpdateError } = await supabase
        .from('drivers')
        .update({ status: 'on_trip' })
        .eq('id', driverId);
        
      if (driverUpdateError) {
        console.error('Warning: Failed to update driver status:', driverUpdateError);
      }

      await fetchOrders();
      toast.success('Você aceitou esta corrida com sucesso!');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error accepting order:', err);
      setError(err.message || 'Erro ao aceitar ordem de serviço');
      return Promise.reject(err);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      toast.info('Corrida ignorada');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error rejecting order:', err);
      setError(err.message || 'Erro ao rejeitar ordem de serviço');
      return Promise.reject(err);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (!response.success) {
        throw new Error(response.error ? response.error.toString() : 'Failed to update status');
      }
      
      const statusMessages: Record<string, string> = {
        'in_progress': 'Corrida iniciada com sucesso!',
        'completed': 'Corrida finalizada com sucesso!',
        'cancelled': 'Corrida foi cancelada'
      };
      
      if (statusMessages[newStatus]) {
        toast.success(statusMessages[newStatus]);
      }

      await fetchOrders();
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Erro ao atualizar status da ordem');
      return Promise.reject(err);
    }
  };

  return {
    orders,
    isLoading,
    error,
    refreshOrders: fetchOrders,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateStatus,
  };
};
