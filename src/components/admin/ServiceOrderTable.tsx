
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
import { Eye, MapPin, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderDetailModal from './OrderDetailModal';

export interface ServiceOrder {
  id: string;
  company_id: string;
  company_name?: string;
  driver_id: string | null;
  driver_name?: string | null;
  vehicle_id: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Truncate long text to avoid layout issues
  const truncateText = (text: string, length = 20) => {
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
        <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data Coleta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id}>
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
                <TableCell>{formatDate(order.pickup_date)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={detailsOpen}
          onClose={handleCloseDetails}
          onStatusChange={onRefreshData}
        />
      )}
    </>
  );
};

export default ServiceOrderTable;
