
import { useState, useEffect } from 'react';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface ServiceOrder {
  id: string;
  company_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company_name?: string;
}

export const useServiceOrders = (driverId: string | null) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyContext } = useAuth();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders'
        },
        (_) => {
          // Refresh data when changes occur
          if (driverId) {
            fetchOrders();
          } else {
            fetchAvailableOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  // Fetch orders when component mounts or driverId changes
  useEffect(() => {
    if (driverId) {
      fetchOrders();
    } else {
      // If we don't have a driverId yet, just fetch available orders
      fetchAvailableOrders();
    }
  }, [driverId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    const companyId = companyContext?.id;
    
    try {
      // Fetch assigned orders (where driver_id is the current driver)
      const { data: assignedData, error: assignedError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .eq('driver_id', driverId)
        .eq('company_id', companyId || 'any');  // Filter by company ID if available

      if (assignedError) throw assignedError;

      // Fetch available orders (where status is pending and driver_id is null)
      const { data: availableData, error: availableError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .is('driver_id', null)
        .eq('status', 'pending')
        .eq('company_id', companyId || 'any');  // Filter by company ID if available

      if (availableError) throw availableError;

      // Transform the data to match the format we need
      const processedAssigned = assignedData ? assignedData.map(order => ({
        ...order,
        company_name: order.companies ? order.companies.name : 'Desconhecida'
      })) : [];

      const processedAvailable = availableData ? availableData.map(order => ({
        ...order,
        company_name: order.companies ? order.companies.name : 'Desconhecida'
      })) : [];

      // Combine both sets of orders
      setOrders([...processedAssigned, ...processedAvailable]);

    } catch (error: any) {
      console.error('Erro ao buscar ordens de serviço:', error);
      setError(error.message || 'Erro ao buscar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    const companyId = companyContext?.id;
    
    try {
      const query = supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .is('driver_id', null)
        .eq('status', 'pending');
        
      // If we have a company context, filter by company ID
      if (companyId) {
        query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      // Transform the data
      const processedData = data ? data.map(order => ({
        ...order,
        company_name: order.companies ? order.companies.name : 'Desconhecida'
      })) : [];

      setOrders(processedData);

    } catch (error: any) {
      console.error('Erro ao buscar ordens disponíveis:', error);
      setError(error.message || 'Erro ao buscar ordens disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to accept an order
  const handleAcceptOrder = async (orderId: string) => {
    if (!driverId) {
      const errorMsg = 'ID do motorista não disponível';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
      toast.success('Corrida aceita com sucesso!');
    } catch (error: any) {
      console.error('Erro ao aceitar ordem de serviço:', error);
      toast.error(error.message || 'Erro ao aceitar corrida');
      throw error;
    }
  };

  // Function to reject an order
  const handleRejectOrder = async (orderId: string) => {
    // In a real app, we might want to track rejected orders
    // For now, we'll just log it and not modify the database
    try {
      // You could implement a proper rejection system here
      console.log(`Ordem ${orderId} rejeitada`);
      // This is just a placeholder since we don't actually have a rejection status
      // In a real app, you might want to store this in a separate table
      toast.success('Corrida rejeitada');
    } catch (error: any) {
      console.error('Erro ao rejeitar ordem:', error);
      toast.error(error.message || 'Erro ao rejeitar corrida');
      throw error;
    }
  };

  // Function to update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // For completed orders, add a delivery date
      const updates: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updates.delivery_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
      
      const statusMessages: {[key: string]: string} = {
        'assigned': 'Corrida atribuída com sucesso',
        'in_progress': 'Corrida iniciada com sucesso',
        'completed': 'Corrida finalizada com sucesso',
        'cancelled': 'Corrida cancelada'
      };
      
      toast.success(statusMessages[newStatus] || 'Status atualizado');
    } catch (error: any) {
      console.error('Erro ao atualizar status da ordem:', error);
      toast.error(error.message || 'Erro ao atualizar status');
      throw error;
    }
  };

  return {
    orders,
    isLoading,
    error,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateStatus,
    refreshOrders: fetchOrders
  };
};
