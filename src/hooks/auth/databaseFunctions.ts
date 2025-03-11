
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

// Define the RPC function return type without constraints
export type RPCFunctionReturnType<T = any> = T;

// Export function parameter types to be used with RPC calls
export type RPCParams = ValidateDriverCompanyParams;
