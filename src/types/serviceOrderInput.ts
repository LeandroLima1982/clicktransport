
// Define the status types for service orders
export type ServiceOrderStatus = 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// Input for creating a service order
export interface ServiceOrderInput {
  booking_id?: string;
  company_id: string;
  driver_id?: string | null;
  vehicle_id?: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date?: string | null;
  status: ServiceOrderStatus;
  notes?: string | null;
  passenger_data?: any;
  total_price?: number | null;
}
