import { supabase } from '../integrations/supabase/client';

// Utility function to identify and fix duplicate company records
export const identifyDuplicateCompanies = async () => {
  try {
    // Find user_ids that have more than one company
    // Using raw SQL query instead of group_by which isn't available in the type definition
    const { data, error } = await supabase
      .rpc('get_duplicate_companies');
    
    if (error) throw error;
    
    return { 
      duplicates: data || [],
      count: data?.length || 0,
      error: null
    };
  } catch (error: any) {
    console.error('Error identifying duplicate companies:', error);
    return { 
      duplicates: [], 
      count: 0, 
      error: error.message 
    };
  }
};

// Utility function to fix duplicate companies - this should be run by an admin
export const fixDuplicateCompanies = async () => {
  try {
    // This would normally be implemented as an SQL function for security
    // For demonstration, we're showing the logic here
    const { duplicates, error } = await identifyDuplicateCompanies();
    
    if (error) throw new Error(error);
    
    const fixResults = [];
    
    for (const duplicate of duplicates || []) {
      const userId = duplicate.user_id;
      
      // Get all companies for this user
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at');
      
      if (companies && companies.length > 1) {
        // Keep the first company (oldest) and mark others for removal
        const [keepCompany, ...removeCompanies] = companies;
        
        // Remove the duplicate companies
        for (const company of removeCompanies) {
          const { error: deleteError } = await supabase
            .from('companies')
            .delete()
            .eq('id', company.id);
          
          fixResults.push({
            userId,
            keptCompanyId: keepCompany.id,
            removedCompanyId: company.id,
            success: !deleteError,
            error: deleteError ? deleteError.message : null
          });
        }
      }
    }
    
    return { 
      fixed: fixResults,
      count: fixResults.length,
      error: null
    };
  } catch (error: any) {
    console.error('Error fixing duplicate companies:', error);
    return { 
      fixed: [],
      count: 0,
      error: error.message 
    };
  }
};
