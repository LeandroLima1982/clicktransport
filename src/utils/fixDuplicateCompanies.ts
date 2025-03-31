
import { supabase } from '../integrations/supabase/client';

// Utility function to identify and fix duplicate company records
export const identifyDuplicateCompanies = async () => {
  try {
    // Find user_ids that have more than one company
    // Using raw SQL query instead of group_by which isn't available in the type definition
    const { data, error } = await supabase
      .from('companies')
      .select('user_id, count:id')
      .not('user_id', 'is', null)
      .select('user_id')
      .select('count:id', { count: 'exact', head: false })
      .filter('user_id', 'not.is', null)
      .then(result => {
        // Process the data to find duplicates
        if (result.error) throw result.error;
        
        // Group by user_id and count occurrences
        const userCounts: Record<string, number> = {};
        result.data?.forEach(item => {
          if (item.user_id) {
            userCounts[item.user_id] = (userCounts[item.user_id] || 0) + 1;
          }
        });
        
        // Filter to only include user_ids with more than one company
        const duplicates = Object.entries(userCounts)
          .filter(([_, count]) => count > 1)
          .map(([user_id, count]) => ({ user_id, count }));
        
        return { data: duplicates, error: null };
      });
    
    if (error) throw error;
    
    return { 
      duplicates: data || [],
      count: data ? data.length : 0,
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
    
    for (const duplicate of duplicates) {
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
