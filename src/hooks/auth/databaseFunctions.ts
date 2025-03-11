
import { Database } from '../../integrations/supabase/types';

// Define the function parameters and return type
export type DbFunctionResponse = {
  data: boolean | null;
  error: Error | null;
};

// Define the parameter types for our database functions
export interface ValidateDriverCompanyParams {
  _email: string;
  _company_id: string;
}
