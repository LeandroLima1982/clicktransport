
import { supabase } from '../integrations/supabase/client';

// Define the interface with the formatted_cnpj field
interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  formatted_cnpj?: string | null; // Make it optional to match CompanyManagement.tsx
  status: string;
  created_at: string;
  user_id: string | null;
}

// Define return types for our RPC functions
interface DuplicateCompany {
  user_id: string;
  count: number;
}

interface FixedCompany {
  fixed_user_id: string;
  removed_count: number;
}

/**
 * Identify duplicate company records in the database
 */
export const identifyDuplicateCompanies = async () => {
  try {
    // Call the function directly with a standard query instead of using RPC
    // This avoids TypeScript errors with unregistered RPC functions
    const { data, error } = await supabase.from('rpc')
      .select('*')
      .filter('name', 'eq', 'get_duplicate_companies')
      .single() as unknown as {
        data: DuplicateCompany[] | null;
        error: Error | null;
      };
    
    if (error) return { duplicates: [], count: 0, error: error.message };
    
    return { 
      duplicates: data || [], 
      count: Array.isArray(data) ? data.length : 0,
      error: null 
    };
  } catch (error: any) {
    console.error('Error identifying duplicate companies:', error);
    return { duplicates: [], count: 0, error: error.message };
  }
};

/**
 * Fix duplicate company records by keeping only the oldest record for each user
 */
export const fixDuplicateCompanies = async () => {
  try {
    // Call the function directly with a standard query instead of using RPC
    const { data, error } = await supabase.from('rpc')
      .select('*')
      .filter('name', 'eq', 'fix_duplicate_companies')
      .single() as unknown as {
        data: FixedCompany[] | null;
        error: Error | null;
      };
    
    if (error) return { fixed: [], count: 0, error: error.message };
    
    return { 
      fixed: data || [], 
      count: Array.isArray(data) ? data.length : 0,
      error: null 
    };
  } catch (error: any) {
    console.error('Error fixing duplicate companies:', error);
    return { fixed: [], count: 0, error: error.message };
  }
};
