
export interface Trip {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: string;
  driver_id?: string;
  company_id?: string;
  created_at: string;
  notes?: string;
  start_address?: string;
  end_address?: string;
  start_time?: string;
  end_time?: string;
  price?: number;
}
