
export interface Vehicle {
  id: string;
  company_id: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
  created_at: string;
  type: string; // Added the type property to fix the TypeScript error
}
