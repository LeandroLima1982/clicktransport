
export interface ServiceOrder {
  id: string;
  company_id: string;
  driver_id?: string;
  vehicle_id?: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date?: string;
  status: 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  company_name?: string;
  driver_name?: string;
}
