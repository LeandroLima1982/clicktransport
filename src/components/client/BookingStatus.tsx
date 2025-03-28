
import React from 'react';
import { CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type BookingStatusProps = {
  status: string;
  className?: string;
  size?: string; // Add size prop
};

const BookingStatus: React.FC<BookingStatusProps> = ({ status, className, size }) => {
  // Apply size-specific styles if size is provided
  const textSizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSizeClass = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  
  switch (status.toLowerCase()) {
    case 'confirmed':
      return (
        <div className={cn(`flex items-center gap-1 ${textSizeClass} font-medium rounded-full bg-green-100 text-green-800 px-3 py-1`, className)}>
          <CheckCircle className={iconSizeClass} />
          <span>Confirmada</span>
        </div>
      );
    case 'pending':
      return (
        <div className={cn(`flex items-center gap-1 ${textSizeClass} font-medium rounded-full bg-yellow-100 text-yellow-800 px-3 py-1`, className)}>
          <Clock className={iconSizeClass} />
          <span>Pendente</span>
        </div>
      );
    case 'completed':
      return (
        <div className={cn(`flex items-center gap-1 ${textSizeClass} font-medium rounded-full bg-blue-100 text-blue-800 px-3 py-1`, className)}>
          <CheckCircle className={iconSizeClass} />
          <span>Concluída</span>
        </div>
      );
    case 'cancelled':
      return (
        <div className={cn(`flex items-center gap-1 ${textSizeClass} font-medium rounded-full bg-red-100 text-red-800 px-3 py-1`, className)}>
          <X className={iconSizeClass} />
          <span>Cancelada</span>
        </div>
      );
    default:
      return (
        <div className={cn(`flex items-center gap-1 ${textSizeClass} font-medium rounded-full bg-gray-100 text-gray-800 px-3 py-1`, className)}>
          <AlertCircle className={iconSizeClass} />
          <span>Desconhecido</span>
        </div>
      );
  }
};

export default BookingStatus;
