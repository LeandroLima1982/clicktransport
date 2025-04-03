
import { ServiceOrder } from './serviceOrder';

/**
 * Type for creating a new service order
 * Using specific literal types to avoid deep type instantiation issues
 */
export type ServiceOrderInput = {
  booking_id: string;
  company_id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  passenger_data: any | null;
  vehicle_id?: string | null;
  driver_id?: string | null;
};

/**
 * Type for updating a service order status
 */
export type ServiceOrderStatusUpdate = {
  status: ServiceOrder['status'];
  delivery_date?: string;
};
