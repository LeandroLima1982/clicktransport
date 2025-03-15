
import React from 'react';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

type BookingStatusProps = {
  status: string;
};

const BookingStatus: React.FC<BookingStatusProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return (
        <div className="flex items-center gap-1 text-sm font-medium rounded-full bg-green-100 text-green-800 px-3 py-1">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Confirmada</span>
        </div>
      );
    case 'pending':
      return (
        <div className="flex items-center gap-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 px-3 py-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Pendente</span>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center gap-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 px-3 py-1">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Concluída</span>
        </div>
      );
    case 'cancelled':
      return (
        <div className="flex items-center gap-1 text-sm font-medium rounded-full bg-red-100 text-red-800 px-3 py-1">
          <X className="h-3.5 w-3.5" />
          <span>Cancelada</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 px-3 py-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Desconhecido</span>
        </div>
      );
  }
};

export default BookingStatus;
