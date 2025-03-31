
import { supabase } from '../integrations/supabase/client';

// Define the interface with the formatted_cnpj field
interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  formatted_cnpj: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

/**
 * Identify duplicate company records in the database
 */
export const identifyDuplicateCompanies = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_duplicate_companies');
    
    if (error) return { duplicates: [], count: 0, error: error.message };
    
    return { 
      duplicates: data || [], 
      count: data?.length || 0,
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
    const { data, error } = await supabase
      .rpc('fix_duplicate_companies');
    
    if (error) return { fixed: [], count: 0, error: error.message };
    
    return { 
      fixed: data || [], 
      count: data?.length || 0,
      error: null 
    };
  } catch (error: any) {
    console.error('Error fixing duplicate companies:', error);
    return { fixed: [], count: 0, error: error.message };
  }
};
