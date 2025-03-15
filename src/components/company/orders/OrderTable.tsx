
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
import { Eye, MoreHorizontal, Map } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceOrder, Driver, statusMap, getStatusBadgeClass } from './types';
import { formatRelativeDate, truncateAddress } from './utils';

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
  // Function to get driver name from driver id
  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Não atribuído';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Desconhecido';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
        <Button 
          variant="outline" 
          onClick={onDataRefresh} 
          className="mt-4"
        >
          Atualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Origem/Destino</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="truncate max-w-52" title={order.origin}>
                    <span className="text-xs text-muted-foreground">De:</span> {truncateAddress(order.origin, 40)}
                  </div>
                  <div className="truncate max-w-52" title={order.destination}>
                    <span className="text-xs text-muted-foreground">Para:</span> {truncateAddress(order.destination, 40)}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getDriverName(order.driver_id)}</TableCell>
              <TableCell>{formatRelativeDate(order.pickup_date)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                  {statusMap[order.status] || order.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTrackOrder(order.id)}>
                      <Map className="mr-2 h-4 w-4" />
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
