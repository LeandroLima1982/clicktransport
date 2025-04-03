
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Eye } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ServiceOrder } from '../ServiceOrderTable';

interface ServiceOrderActionsProps {
  order: ServiceOrder;
  onViewDetails: (order: ServiceOrder) => void;
  onStatusChange: (order: ServiceOrder, newStatus: string) => void;
  updatingStatus: boolean;
}

const ServiceOrderActions: React.FC<ServiceOrderActionsProps> = ({
  order,
  onViewDetails,
  onStatusChange,
  updatingStatus
}) => {
  return (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Ações</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onViewDetails(order)}>
        <Eye className="mr-2 h-4 w-4" />
        Ver Detalhes
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
      {order.status !== 'pending' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'pending')}
          disabled={updatingStatus}
        >
          <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pendente</Badge>
        </DropdownMenuItem>
      )}
      {order.status !== 'created' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'created')}
          disabled={updatingStatus}
        >
          <Badge className="bg-purple-100 text-purple-800 mr-2">Criado</Badge>
        </DropdownMenuItem>
      )}
      {order.status !== 'assigned' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'assigned')}
          disabled={updatingStatus || !order.driver_id}
        >
          <Badge className="bg-indigo-100 text-indigo-800 mr-2">Atribuído</Badge>
        </DropdownMenuItem>
      )}
      {order.status !== 'in_progress' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'in_progress')}
          disabled={updatingStatus}
        >
          <Badge className="bg-blue-100 text-blue-800 mr-2">Em Progresso</Badge>
        </DropdownMenuItem>
      )}
      {order.status !== 'completed' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'completed')}
          disabled={updatingStatus}
        >
          <Badge className="bg-green-100 text-green-800 mr-2">Concluído</Badge>
        </DropdownMenuItem>
      )}
      {order.status !== 'cancelled' && (
        <DropdownMenuItem 
          onClick={() => onStatusChange(order, 'cancelled')}
          disabled={updatingStatus}
        >
          <Badge className="bg-red-100 text-red-800 mr-2">Cancelado</Badge>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
};

export default ServiceOrderActions;
