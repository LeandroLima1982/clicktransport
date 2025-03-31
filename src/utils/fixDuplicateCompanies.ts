
import { supabase } from '../integrations/supabase/client';

// Define the interface with the formatted_cnpj field
interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  formatted_cnpj?: string | null; // Optional field
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
    // Use the exec_sql function to run custom SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: "SELECT user_id, COUNT(*) FROM companies GROUP BY user_id HAVING COUNT(*) > 1"
    });
    
    if (error) return { duplicates: [], count: 0, error: error.message };
    
    // Parse and format the results
    const duplicates = Array.isArray(data) ? data : [];
    
    return { 
      duplicates, 
      count: duplicates.length,
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
    // Use the exec_sql function to run custom SQL that fixes duplicates
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        WITH duplicates AS (
          SELECT user_id
          FROM companies
          WHERE user_id IS NOT NULL
          GROUP BY user_id
          HAVING COUNT(*) > 1
        ),
        to_keep AS (
          SELECT DISTINCT ON (c.user_id) c.id
          FROM companies c
          JOIN duplicates d ON c.user_id = d.user_id
          ORDER BY c.user_id, c.created_at ASC
        )
        DELETE FROM companies c
        WHERE c.user_id IN (SELECT user_id FROM duplicates)
        AND c.id NOT IN (SELECT id FROM to_keep)
        RETURNING c.user_id as fixed_user_id, 1 as removed_count
      `
    });
    
    if (error) return { fixed: [], count: 0, error: error.message };
    
    // Parse and format the results
    const fixed = Array.isArray(data) ? data : [];
    
    return { 
      fixed, 
      count: fixed.length,
      error: null 
    };
  } catch (error: any) {
    console.error('Error fixing duplicate companies:', error);
    return { fixed: [], count: 0, error: error.message };
  }
};
