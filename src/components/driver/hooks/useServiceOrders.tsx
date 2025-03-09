
import { useState, useEffect } from 'react';
import { supabase } from '@/main';
import { toast } from 'sonner';

export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  company_id: string;
  company_name?: string;
  driver_id: string | null;
}

export const useServiceOrders = (driverId: string | null) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!driverId) return;
    
    setIsLoading(true);
    try {
      const { data: assignedOrders, error: assignedError } = await supabase
        .from('service_orders')
        .select('*, companies(name)')
        .eq('driver_id', driverId)
        .in('status', ['assigned', 'in_progress'])
        .order('pickup_date', { ascending: true });

      if (assignedError) throw assignedError;

      const { data: availableOrders, error: availableError } = await supabase
        .from('service_orders')
        .select('*, companies(name)')
        .eq('status', 'pending')
        .is('driver_id', null)
        .order('pickup_date', { ascending: true });

      if (availableError) throw availableError;

      const formattedAssigned = assignedOrders?.map((order: any) => ({
        ...order,
        company_name: order.companies?.name
      })) || [];

      const formattedAvailable = availableOrders?.map((order: any) => ({
        ...order,
        company_name: order.companies?.name
      })) || [];

      setOrders([...formattedAssigned, ...formattedAvailable]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Ordem de serviço aceita com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Erro ao aceitar ordem de serviço');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      toast.info('Ordem de serviço rejeitada');
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Erro ao rejeitar ordem de serviço');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  useEffect(() => {
    if (driverId) {
      fetchOrders();
    }
  }, [driverId]);

  return { 
    orders, 
    isLoading, 
    handleAcceptOrder, 
    handleRejectOrder, 
    handleUpdateStatus, 
    fetchOrders 
  };
};
