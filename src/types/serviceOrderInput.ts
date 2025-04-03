
/**
 * Literal type for service order status
 */
export type ServiceOrderStatus = 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Type for creating a new service order
 */
export type ServiceOrderInput = {
  booking_id: string;
  company_id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: ServiceOrderStatus;
  notes: string | null;
  passenger_data: any | null;
  vehicle_id?: string | null;
  driver_id?: string | null;
};

/**
 * Type for updating a service order status
 */
export type ServiceOrderStatusUpdate = {
  status: ServiceOrderStatus;
  delivery_date?: string;
};
