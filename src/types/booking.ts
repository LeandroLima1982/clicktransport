
export interface Booking {
  id: string;
  reference_code: string;
  origin: string;
  destination: string;
  booking_date: string;
  travel_date: string;
  return_date?: string | null;
  vehicle_type?: string | null;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  total_price: number;
  passengers?: number | null;
  additional_notes?: string | null;
  created_at: string;
  user_id: string;
  passenger_data?: any;
  
  // Adding driver and company related properties
  driver_id?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  company_phone?: string | null;
}
