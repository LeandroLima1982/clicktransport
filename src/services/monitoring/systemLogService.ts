
import { supabase } from '@/integrations/supabase/client';

/**
 * Log an informational message
 */
export const logInfo = async (message: string, category: string, details?: any) => {
  try {
    await supabase.from('system_logs').insert({
      message,
      category,
      severity: 'info',
      details
    });
  } catch (error) {
    console.error('Error logging info message:', error);
  }
};

/**
 * Log a warning message
 */
export const logWarning = async (message: string, category: string, details?: any) => {
  try {
    await supabase.from('system_logs').insert({
      message,
      category,
      severity: 'warning',
      details
    });
  } catch (error) {
    console.error('Error logging warning message:', error);
  }
};

/**
 * Log an error message
 */
export const logError = async (message: string, category: string, details?: any) => {
  try {
    await supabase.from('system_logs').insert({
      message,
      category,
      severity: 'error',
      details
    });
  } catch (error) {
    console.error('Error logging error message:', error);
  }
};

/**
 * Log a critical error message
 */
export const logCritical = async (message: string, category: string, details?: any) => {
  try {
    await supabase.from('system_logs').insert({
      message,
      category,
      severity: 'critical',
      details
    });
  } catch (error) {
    console.error('Error logging critical message:', error);
  }
};

/**
 * Get logs by category
 */
export const getLogsByCategory = async (category: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return { logs: data, error: null };
  } catch (error) {
    console.error('Error fetching logs by category:', error);
    return { logs: [], error };
  }
};

/**
 * Clean logs by category
 */
export const cleanLogsByCategory = async (category: string) => {
  try {
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .eq('category', category);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error cleaning logs by category:', error);
    return { success: false, error };
  }
};

export default {
  logInfo,
  logWarning,
  logError,
  logCritical,
  getLogsByCategory,
  cleanLogsByCategory
};
