
import { supabase } from '../../../integrations/supabase/client';

// Fetch companies for driver login
export const fetchCompanies = async () => {
  try {
    console.log('Fetching companies from Supabase...');
    
    // Get all active companies
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    
    if (error) {
      console.error('Error fetching companies from database:', error);
      return { data: null, error };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} companies:`, data);
    
    if (!data || data.length === 0) {
      console.warn('No companies found in the database');
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception occurred while fetching companies:', err);
    return { data: null, error: err as Error };
  }
};
