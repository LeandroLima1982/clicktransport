import { useState, useEffect } from 'react';
import { supabase } from '@/main';

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
    try {
      // Fetch assigned orders (where driver_id is the current driver)
      const { data: assignedData, error: assignedError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .eq('driver_id', driverId);

      if (assignedError) throw assignedError;

      // Fetch available orders (where status is pending and driver_id is null)
      const { data: availableData, error: availableError } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .is('driver_id', null)
        .eq('status', 'pending');

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

    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (name)
        `)
        .is('driver_id', null)
        .eq('status', 'pending');

      if (error) throw error;

      // Transform the data
      const processedData = data ? data.map(order => ({
        ...order,
        company_name: order.companies ? order.companies.name : 'Desconhecida'
      })) : [];

      setOrders(processedData);

    } catch (error) {
      console.error('Erro ao buscar ordens disponíveis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to accept an order
  const handleAcceptOrder = async (orderId: string) => {
    if (!driverId) {
      console.error('ID do motorista não disponível');
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
    } catch (error) {
      console.error('Erro ao aceitar ordem de serviço:', error);
    }
  };

  // Function to reject an order
  const handleRejectOrder = async (orderId: string) => {
    // For now we'll just leave this as a placeholder
    // In a real application, maybe we would mark it as rejected by this driver
    console.log(`Ordem ${orderId} rejeitada`);
  };

  // Function to update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar status da ordem:', error);
    }
  };

  return {
    orders,
    isLoading,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateStatus
  };
};
