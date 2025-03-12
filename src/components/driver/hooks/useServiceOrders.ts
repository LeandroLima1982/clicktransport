
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { playNotificationSound } from '@/services/notifications/notificationService';

export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: string;
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
      // Fetch all orders that:
      // 1. Are assigned to this driver, OR
      // 2. Are unassigned (pending) and available for claiming
      const { data, error: ordersError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies:company_id(name)
        `)
        .or(`driver_id.eq.${driverId},and(driver_id.is.null,status.eq.pending)`)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Format orders to include company name
      const formattedOrders = data?.map(order => ({
        ...order,
        company_name: order.companies?.name || null
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!driverId) return;

    // Create a real-time subscription to service orders changes
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
          
          // Notify driver about new assignments
          if (payload.eventType === 'UPDATE' && 
              payload.old.driver_id !== payload.new.driver_id && 
              payload.new.driver_id === driverId) {
            playNotificationSound();
            toast.success('Nova corrida atribuída!', { 
              description: `Origem: ${payload.new.origin}`,
              duration: 6000
            });
          }

          // Refresh orders list
          fetchOrders();
        }
      )
      .subscribe();

    // Also subscribe to pending orders (for orders that might become available)
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
          // Refresh orders list when new pending orders appear
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(pendingChannel);
    };
  }, [driverId, fetchOrders]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Function to handle accepting an order
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

      await fetchOrders();
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error accepting order:', err);
      setError(err.message || 'Erro ao aceitar ordem de serviço');
      return Promise.reject(err);
    }
  };

  // Function to handle rejecting an order
  const handleRejectOrder = async (orderId: string) => {
    try {
      // In this implementation, rejection just means the driver will not see the order anymore
      // We're not actually changing the order status, just filtering it out locally
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error rejecting order:', err);
      setError(err.message || 'Erro ao rejeitar ordem de serviço');
      return Promise.reject(err);
    }
  };

  // Function to update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error: updateError } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

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
