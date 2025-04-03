
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, MoreHorizontal, AlertTriangle, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logInfo } from '@/services/monitoring/systemLogService';
import { ServiceOrderStatus } from '@/types/serviceOrderInput';

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
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'assigned':
        return <Badge className="bg-indigo-100 text-indigo-800">Atribuído</Badge>;
      case 'created':
        return <Badge className="bg-purple-100 text-purple-800">Criado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const truncateText = (text: string, length = 20) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p>Carregando ordens de serviço...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col h-60">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique se as reservas estão sendo convertidas em ordens de serviço corretamente
        </p>
      </div>
    );
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
            <TableRow key={order.id}>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="font-medium">{order.company_name || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {truncateText(order.origin)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {truncateText(order.destination)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  {formatDate(order.pickup_date)}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                    {order.status !== 'pending' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'pending')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pendente</Badge>
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'created' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'created')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-purple-100 text-purple-800 mr-2">Criado</Badge>
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'assigned' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'assigned')}
                        disabled={updatingStatus || !order.driver_id}
                      >
                        <Badge className="bg-indigo-100 text-indigo-800 mr-2">Atribuído</Badge>
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'in_progress' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'in_progress')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-blue-100 text-blue-800 mr-2">Em Progresso</Badge>
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'completed' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'completed')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-green-100 text-green-800 mr-2">Concluído</Badge>
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'cancelled' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(order, 'cancelled')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-red-100 text-red-800 mr-2">Cancelado</Badge>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceOrderTable;
