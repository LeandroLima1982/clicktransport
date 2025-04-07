
import React from 'react';
import { Badge } from '@/components/ui/badge';
// Use type-only import to avoid naming conflicts
import type { ServiceOrderStatus as ServiceOrderStatusType } from '@/types/serviceOrderInput';

export const getStatusColor = (status: ServiceOrderStatusType) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'created': 'bg-blue-100 text-blue-800',
    'assigned': 'bg-purple-100 text-purple-800',
    'in_progress': 'bg-indigo-100 text-indigo-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusTranslation = (status: ServiceOrderStatusType) => {
  const translations = {
    'pending': 'Pendente',
    'created': 'Criada',
    'assigned': 'Motorista Atribuído',
    'in_progress': 'Em Andamento',
    'completed': 'Concluída',
    'cancelled': 'Cancelada'
  };
  
  return translations[status] || status;
};

interface OrderStatusBadgeProps {
  status: ServiceOrderStatusType;
  className?: string;
  showLabel?: boolean;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status,
  className = '',
  showLabel = true
}) => {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`}>
      {showLabel ? getStatusTranslation(status) : status}
    </Badge>
  );
};

export default OrderStatusBadge;
