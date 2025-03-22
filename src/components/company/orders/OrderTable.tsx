
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, MapPin, User, Calendar, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceOrder, Driver, statusMap, getStatusBadgeClass } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OrderTableProps {
  orders: ServiceOrder[];
  drivers: Driver[];
  loading: boolean;
  onViewDetails: (order: ServiceOrder) => void;
  onDataRefresh: () => void;
  onTrackOrder: (orderId: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  drivers,
  loading,
  onViewDetails,
  onDataRefresh,
  onTrackOrder
}) => {
  const [isAssigning, setIsAssigning] = useState<Record<string, boolean>>({});

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      // Prevent multiple clicks
      setIsAssigning(prev => ({ ...prev, [orderId]: true }));
      
      console.log(`Assigning driver ${driverId} to order ${orderId}`);
      
      // Update the service order directly
      const { data, error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: 'assigned' 
        })
        .eq('id', orderId)
        .select();
      
      if (error) {
        console.error('Error updating service order:', error);
        throw error;
      }
      
      console.log('Order updated successfully:', data);
      
      toast.success('Motorista atribuído com sucesso');
      onDataRefresh();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Erro ao atribuir motorista');
    } finally {
      setIsAssigning(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando ordens de serviço...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-4">Nenhuma ordem de serviço encontrada</div>;
  }

  // Filter out drivers who are inactive or already on a trip
  const availableDrivers = drivers.filter(driver => 
    driver.status === 'active' || driver.status === undefined
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Origem/Destino</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="group">
              <TableCell>
                <Badge className={`${getStatusBadgeClass(order.status)}`}>
                  {statusMap[order.status] || order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-green-500" />
                    <span className="truncate max-w-[250px]">{order.origin}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    <span className="truncate max-w-[250px]">{order.destination}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(order.pickup_date)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {order.status === 'pending' || order.status === 'created' ? (
                  <Select 
                    onValueChange={(value) => handleAssignDriver(order.id, value)}
                    disabled={isAssigning[order.id]}
                  >
                    <SelectTrigger className="h-8 w-[180px]">
                      <SelectValue placeholder={isAssigning[order.id] ? 'Atribuindo...' : 'Atribuir motorista'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.length === 0 ? (
                        <div className="p-2 text-sm text-center">
                          Não há motoristas disponíveis
                        </div>
                      ) : (
                        availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      {drivers.find(d => d.id === order.driver_id)?.name || 'Não atribuído'}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewDetails(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTrackOrder(order.id)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Rastrear
                    </DropdownMenuItem>
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

export default OrderTable;
