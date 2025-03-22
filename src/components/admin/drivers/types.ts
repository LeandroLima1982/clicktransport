
export interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  license_number: string | null;
  last_login: string | null;
  company_id: string | null;
  is_password_changed: boolean | null;
  vehicle_id: string | null;
  companies?: {
    name: string;
    id: string;
  } | null;
}
