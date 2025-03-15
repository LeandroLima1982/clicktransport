
export interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  status: string;
  driver_id: string | null;
  [key: string]: any; // for other properties that might be needed
}
