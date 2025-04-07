
import { ServiceOrder } from './serviceOrder';

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  reference_code: string;
  user_id: string;
  origin: string;
  destination: string;
  booking_date: string;
  travel_date: string | null;
  return_date: string | null;
  passengers?: number;
  status: BookingStatus;
  total_price: number;
  company_id: string | null;
  company_name: string | null;
  driver_id?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  vehicle_type?: string | null;
  additional_notes?: string | null;
  created_at: string;
  company_phone?: string | null;
  passenger_data?: any;
  service_orders?: ServiceOrder[];
  has_service_order?: boolean;
}
