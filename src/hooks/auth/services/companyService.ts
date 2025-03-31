
import { supabase } from '../../../integrations/supabase/client';

// Fetch all companies
export const fetchCompanies = async (status?: string) => {
  try {
    let query = supabase
      .from('companies')
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return { data: null, error: error.message };
  }
};

// Create a company record (used by admin panel)
export const createCompany = async (companyData: any) => {
  try {
    // Ensure manual_creation flag is set
    const dataWithFlag = {
      ...companyData,
      manual_creation: true
    };
    
    const { data, error } = await supabase
      .from('companies')
      .insert(dataWithFlag)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating company:', error);
    return { data: null, error: error.message };
  }
};

// Update a company record
export const updateCompany = async (id: string, companyData: any) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating company:', error);
    return { data: null, error: error.message };
  }
};

// Delete a company record
export const deleteCompany = async (id: string) => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting company:', error);
    return { success: false, error: error.message };
  }
};

// Update the database to prevent duplicate company creation
export const updateCompanyTriggerFunction = async () => {
  try {
    // This function would normally execute a SQL command to update the trigger function
    // For security reasons, we should implement this in a separate SQL migration
    
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        CREATE OR REPLACE FUNCTION public.ensure_company_record()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $function$
        BEGIN
          -- Only create a company record if:
          -- 1. The user has a 'company' role
          -- 2. No company record already exists for this user
          -- 3. This is a new user or the role has changed to 'company'
          IF NEW.role = 'company' AND NOT EXISTS (
            SELECT 1 FROM public.companies WHERE user_id = NEW.id
          ) THEN
            -- Create a default company record with a proper queue position
            INSERT INTO public.companies (name, user_id, status, queue_position, manual_creation)
            VALUES (
              COALESCE(NEW.full_name, 'Empresa ' || NEW.email), 
              NEW.id, 
              'pending',
              -- Get max queue position and add 1, or start at 1 if no companies exist
              COALESCE((SELECT MAX(queue_position) + 1 FROM public.companies WHERE status = 'active'), 1),
              FALSE
            );
          END IF;
          RETURN NEW;
        END;
        $function$;
      `
    });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating company trigger function:', error);
    return { success: false, error: error.message };
  }
};

// Function to check and fix any duplicate company records
export const checkAndFixDuplicateCompanies = async () => {
  try {
    const { duplicates, count, error } = await identifyDuplicateCompanies();
    
    if (error) throw new Error(error);
    
    // If there are duplicates, fix them
    if (count > 0) {
      return await fixDuplicateCompanies();
    }
    
    return { fixed: [], count: 0, error: null };
  } catch (error: any) {
    console.error('Error checking and fixing duplicate companies:', error);
    return { fixed: [], count: 0, error: error.message };
  }
};

// Import the duplicate identification and fixing functions
import { identifyDuplicateCompanies, fixDuplicateCompanies } from '../../../utils/fixDuplicateCompanies';
