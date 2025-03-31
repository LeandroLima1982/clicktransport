
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

// Format CNPJ to standard format XX.XXX.XXX/XXXX-XX
export const formatCNPJ = (value: string): string => {
  if (!value) return '';
  
  let digits = value.replace(/\D/g, '');
  if (digits.length > 14) digits = digits.slice(0, 14);
  
  // Format: XX.XXX.XXX/XXXX-XX
  if (digits.length > 12) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  } else if (digits.length > 8) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
  } else if (digits.length > 5) {
    return digits.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
  } else if (digits.length > 2) {
    return digits.replace(/^(\d{2})(\d+)$/, '$1.$2');
  }
  
  return digits;
};

// Create a company record (used by admin panel)
export const createCompany = async (companyData: any) => {
  try {
    // Ensure manual_creation flag is set
    const formattedData = {
      ...companyData,
      manual_creation: true
    };
    
    // If CNPJ exists, make sure it's properly formatted
    if (formattedData.cnpj) {
      // Store the raw CNPJ (database trigger will format it)
      formattedData.cnpj = formattedData.cnpj.replace(/\D/g, '');
    }
    
    const { data, error } = await supabase
      .from('companies')
      .insert(formattedData)
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
    const updateData = { ...companyData };
    
    // If CNPJ exists, make sure it's properly formatted
    if (updateData.cnpj) {
      // Store the raw CNPJ (database trigger will format it)
      updateData.cnpj = updateData.cnpj.replace(/\D/g, '');
    }
    
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
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
