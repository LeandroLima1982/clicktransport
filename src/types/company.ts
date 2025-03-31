
export type Company = {
  id: string;
  name: string;
  cnpj?: string | null;
  formatted_cnpj?: string | null;
  status: string;
  created_at: string;
  user_id?: string | null;
  queue_position?: number | null;
  last_order_assigned?: string | null;
};
