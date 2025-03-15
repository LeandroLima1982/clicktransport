
export interface Booking {
  id: string;
  reference_code: string;
  origin: string;
  destination: string;
  booking_date: string;
  travel_date: string;
  return_date?: string;
  vehicle_type?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  total_price: number;
  passengers?: number;
  additional_notes?: string;
  created_at: string;
}
