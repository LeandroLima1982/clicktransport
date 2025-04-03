
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, AlertCircle } from 'lucide-react';
import { Booking } from '@/types/booking';
import BookingActions from './BookingActions';

interface BookingRowProps {
  booking: Booking;
  isCreatingOrder: boolean;
  onCreateOrder: (booking: Booking) => void;
  onStatusChange: (booking: Booking, newStatus: string) => void;
  onViewDetails: (booking: Booking) => void;
  updatingStatus: boolean;
  formatDate: (date: string) => string;
  truncateText: (text: string, length?: number) => string;
}

const BookingRow = ({
  booking,
  isCreatingOrder,
  onCreateOrder,
  onStatusChange,
  onViewDetails,
  updatingStatus,
  formatDate,
  truncateText
}: BookingRowProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{booking.reference_code}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
          {truncateText(booking.origin)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
          {truncateText(booking.destination)}
        </div>
      </TableCell>
      <TableCell>{formatDate(booking.travel_date)}</TableCell>
      <TableCell>{getStatusBadge(booking.status)}</TableCell>
      <TableCell>
        {booking.has_service_order ? (
          <Badge className="bg-green-100 text-green-800">Criada</Badge>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCreateOrder(booking)}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
                Criando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Criar
              </>
            )}
          </Button>
        )}
      </TableCell>
      <TableCell>
        <BookingActions
          booking={booking}
          onViewDetails={onViewDetails}
          onStatusChange={onStatusChange}
          updatingStatus={updatingStatus}
        />
      </TableCell>
    </TableRow>
  );
};

export default BookingRow;
