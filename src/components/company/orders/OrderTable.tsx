
import React from 'react';
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
import { Eye } from 'lucide-react';
import { ServiceOrder, Driver, Vehicle, getStatusBadgeClass } from './types';
import { formatDate, translateStatus } from './utils';
import { supabase } from '@/main';
import { toast } from 'sonner';

interface OrderTableProps {
  orders: ServiceOrder[];
  drivers: Driver[];
  loading: boolean;
  onViewDetails: (order: ServiceOrder) => void;
  onDataRefresh: () => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ 
  orders, 
  drivers, 
  loading, 
  onViewDetails,
  onDataRefresh
}) => {
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      onDataRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: driverId ? 'assigned' : 'pending'
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Motorista atribuído com sucesso');
      onDataRefresh();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Erro ao atribuir motorista');
    }
  };

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center flex-col">
        <p className="text-muted-foreground mb-2">Nenhuma ordem encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Origem/Destino</TableHead>
            <TableHead>Data de Saída</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{order.origin}</p>
                  <p className="text-muted-foreground">→ {order.destination}</p>
                </div>
              </TableCell>
              <TableCell>
                {formatDate(order.pickup_date)}
              </TableCell>
              <TableCell>
                <select
                  className="px-2 py-1 border rounded text-sm w-full"
                  value={order.driver_id || ''}
                  onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                >
                  <option value="">Não atribuído</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                <Badge className={`px-2 py-1 ${getStatusBadgeClass(order.status)}`}>
                  {translateStatus(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <select
                    className="px-2 py-1 border rounded text-sm"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pendente</option>
                    <option value="assigned">Atribuído</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderTable;
