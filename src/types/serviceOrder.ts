
export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver_id: string | null;
  notes?: string | null;
  company_id?: string;
  pickup_date: string;
  delivery_date?: string | null;
  vehicle_id?: string | null;
  created_at?: string;
}
