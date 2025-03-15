
export interface ServiceOrder {
  id: string;
  company_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'assigned';
  notes: string | null;
  created_at: string;
}

export type ServiceOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'assigned';
