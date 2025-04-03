
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logInfo } from '@/services/monitoring/systemLogService';
import { ServiceOrderStatus } from '@/types/serviceOrderInput';
import ServiceOrderRow from './service-order-table/ServiceOrderRow';
import EmptyState from './service-order-table/EmptyState';
import LoadingState from './service-order-table/LoadingState';
import StatusBadge from './service-order-table/StatusBadge';

export interface ServiceOrder {
  id: string;
  company_id: string;
  company_name?: string | null;
  driver_id: string | null;
  driver_name?: string | null;
  vehicle_id: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: ServiceOrderStatus;
  notes: string | null;
  created_at: string;
  passenger_data?: any;
  total_price?: number;
  trip_type?: 'oneway' | 'roundtrip';
}

interface ServiceOrderTableProps {
  orders: ServiceOrder[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const ServiceOrderTable: React.FC<ServiceOrderTableProps> = ({
  orders,
  isLoading,
  onRefreshData
}) => {
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    // In the future, this could open a modal with detailed information
    toast.info(`Detalhes da ordem: ${order.id.substring(0, 8)}`);
  };

  const handleStatusChange = async (order: ServiceOrder, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      console.log(`Updating order ${order.id} status from ${order.status} to ${newStatus}`);
      
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      
      if (error) throw error;
      
      // Log the status change
      await logInfo(
        `Status da ordem alterado: ${order.id} (${translateStatus(order.status)} → ${translateStatus(newStatus)})`,
        'order',
        { order_id: order.id, old_status: order.status, new_status: newStatus }
      );
      
      toast.success(`Status da ordem atualizado para: ${translateStatus(newStatus)}`);
      onRefreshData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Falha ao atualizar status da ordem');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const translateStatus = (status: string) => {
    const statusNames: Record<string, string> = {
      'pending': 'Pendente',
      'in_progress': 'Em Progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'assigned': 'Atribuído',
      'created': 'Criado'
    };
    
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'Data inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />;
  };
  
  const truncateText = (text: string, length = 20) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-md border overflow-hidden overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Data Coleta</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <ServiceOrderRow
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
              updatingStatus={updatingStatus}
              formatDate={formatDate}
              truncateText={truncateText}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceOrderTable;
