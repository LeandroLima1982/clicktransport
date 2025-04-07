
import { ServiceOrder } from './serviceOrder';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  origin: string;
  destination: string;
  booking_date: string;
  status: BookingStatus;
  reference_code: string;
  distance?: number;
  price?: number;
  passenger_data?: any;
  created_at?: string;
  company_id?: string;
  company_name?: string;
  company_phone?: string;
  is_round_trip?: boolean;
  passengers?: number;
  delivery_date?: string; // Data de entrega para serviços de entrega
  service_type?: string; // Tipo de serviço (passageiro, entrega, etc)
  vehicle_type?: string; // Tipo de veículo solicitado
  additional_notes?: string; // Notas adicionais
  has_service_order?: boolean; // Indicate if a service order has been created
  service_orders?: ServiceOrder[]; // Associated service orders
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  user_id?: string;
  travel_date?: string;
  return_date?: string;
  total_price?: number;
}

export interface BookingInput {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  origin: string;
  destination: string;
  booking_date: string;
  is_round_trip?: boolean;
  passengers?: number;
  service_type?: string;
  vehicle_type?: string;
  additional_notes?: string;
  distance?: number;
  price?: number;
  passenger_data?: any;
  travel_date?: string;
  return_date?: string;
  total_price?: number;
  user_id?: string;
  has_service_order?: boolean;
  status?: BookingStatus;
  reference_code?: string;
}
