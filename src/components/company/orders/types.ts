
export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  created_at?: string;
  company_id?: string;
}

export interface Driver {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
}

export const statusMap: {[key: string]: string} = {
  'pending': 'Pendente',
  'assigned': 'Atribuído',
  'in_progress': 'Em progresso',
  'completed': 'Concluído',
  'cancelled': 'Cancelado'
};

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
