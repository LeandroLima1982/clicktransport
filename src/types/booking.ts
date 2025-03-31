
export type Booking = {
  id: string;
  reference_code: string;
  origin: string;
  destination: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  booking_date: string;
  travel_date: string;
  return_date?: string | null;
  total_price: number;
  vehicle_type?: string | null;
  passengers?: number;
  additional_notes?: string | null;
  user_id: string;
  created_at: string;
  company_id?: string | null;
  company_name?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  
  // Additional fields that may be used in client components
  passenger_data?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  company_phone?: string;
};
