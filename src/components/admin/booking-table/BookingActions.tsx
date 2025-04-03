
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking } from '@/types/booking';

interface BookingActionsProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onStatusChange: (booking: Booking, newStatus: string) => void;
  updatingStatus: boolean;
}

const BookingActions = ({
  booking,
  onViewDetails,
  onStatusChange,
  updatingStatus
}: BookingActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewDetails(booking)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver Detalhes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
        {booking.status !== 'pending' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(booking, 'pending')}
            disabled={updatingStatus}
          >
            <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pendente</Badge>
          </DropdownMenuItem>
        )}
        {booking.status !== 'confirmed' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(booking, 'confirmed')}
            disabled={updatingStatus}
          >
            <Badge className="bg-blue-100 text-blue-800 mr-2">Confirmado</Badge>
          </DropdownMenuItem>
        )}
        {booking.status !== 'completed' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(booking, 'completed')}
            disabled={updatingStatus}
          >
            <Badge className="bg-green-100 text-green-800 mr-2">Concluído</Badge>
          </DropdownMenuItem>
        )}
        {booking.status !== 'cancelled' && (
          <DropdownMenuItem 
            onClick={() => onStatusChange(booking, 'cancelled')}
            disabled={updatingStatus}
          >
            <Badge className="bg-red-100 text-red-800 mr-2">Cancelado</Badge>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookingActions;
