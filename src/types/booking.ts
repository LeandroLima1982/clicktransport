
export type Booking = {
  id: string;
  reference_code: string;
  origin: string;
  destination: string;
  travel_date: string;
  return_date?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  total_price: number;
  booking_date: string;
  passengers: number;
  vehicle_type: string;
  additional_notes: string;
  created_at: string;
  user_id: string;
  
  // Company-related fields
  company_id?: string | null;
  company_name?: string | null;
  
  // Client-related fields
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  
  // Driver-related fields
  passenger_data?: string | any[];
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  company_phone?: string;
  
  // Service order related
  has_service_order?: boolean;
  service_orders?: any[];
};
