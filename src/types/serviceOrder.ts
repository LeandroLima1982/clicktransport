
export type ServiceOrder = {
  id: string;
  company_id: string;
  driver_id?: string | null;
  vehicle_id?: string | null;
  booking_id?: string | null;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date?: string | null;
  status: "pending" | "created" | "assigned" | "in_progress" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
  passenger_data?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  } | null;
  total_price?: number | null;
  trip_type?: string;
  // Relations
  companies?: {
    name: string;
    [key: string]: any;
  };
};
