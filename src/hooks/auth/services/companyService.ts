
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

// Update the database to prevent duplicate company creation
export const updateCompanyTriggerFunction = async () => {
  try {
    // This function would normally execute a SQL command to update the trigger function
    // For security reasons, we should implement this in a separate SQL migration
    // We're including the logic here for reference
    
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
            INSERT INTO public.companies (name, user_id, status, queue_position)
            VALUES (
              COALESCE(NEW.full_name, 'Empresa ' || NEW.email), 
              NEW.id, 
              'active',
              -- Get max queue position and add 1, or start at 1 if no companies exist
              COALESCE((SELECT MAX(queue_position) + 1 FROM public.companies WHERE status = 'active'), 1)
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
