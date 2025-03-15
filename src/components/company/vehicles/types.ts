
export interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  year: number | null;
  status: 'active' | 'maintenance' | 'inactive';
  company_id: string;
  created_at: string;
}

export interface VehicleForm {
  id: string;
  model: string;
  license_plate: string;
  year: string;
  status: string;
}
