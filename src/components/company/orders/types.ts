
import { ServiceOrderStatus } from '@/types/serviceOrderInput';

export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: ServiceOrderStatus;
  notes: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  created_at: string; // Changed from optional to required
  company_id: string;
}

export interface Driver {
  id: string;
  name: string;
  status?: 'active' | 'inactive' | 'on_trip';
}

export interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
}

export const statusMap: {[key: string]: string} = {
  'pending': 'Pendente',
  'created': 'Criado',
  'assigned': 'Atribuído',
  'in_progress': 'Em progresso',
  'completed': 'Concluído',
  'cancelled': 'Cancelado'
};

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'created': return 'bg-blue-50 text-blue-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Add the missing formatRelativeDate function
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  } else {
    // Format to Brazilian date format (DD/MM/YYYY)
    return date.toLocaleDateString('pt-BR');
  }
};
