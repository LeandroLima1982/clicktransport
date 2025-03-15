
export interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  year: number | null;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface VehicleForm {
  id: string;
  model: string;
  license_plate: string;
  year: string;
  status: string;
}
