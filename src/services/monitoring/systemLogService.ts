
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogCategory = 'queue' | 'order' | 'driver' | 'company' | 'system';

export interface SystemLog {
  id?: string;
  message: string;
  details?: any;
  category: LogCategory;
  severity: LogSeverity;
  created_at?: string;
}

/**
 * Creates a system log entry
 */
export const createSystemLog = async (logData: Omit<SystemLog, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        message: logData.message,
        details: logData.details || {},
        category: logData.category,
        severity: logData.severity,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // For critical errors, also trigger a toast notification for admins
    if (logData.severity === 'critical') {
      toast.error(`Sistema: ${logData.message}`, {
        description: 'Um erro crítico foi registrado no log do sistema.',
        duration: 6000,
      });
    }
    
    return { log: data, error: null };
  } catch (error) {
    console.error('Error creating system log:', error);
    return { log: null, error };
  }
};

/**
 * Gets system logs with optional filtering
 */
export const getSystemLogs = async (
  options: {
    category?: LogCategory;
    severity?: LogSeverity;
    limit?: number;
    offset?: number;
  } = {}
) => {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.severity) {
      query = query.eq('severity', options.severity);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { logs: data, error: null };
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return { logs: [], error };
  }
};

/**
 * Convenience methods for different log severities
 */
export const logInfo = (message: string, category: LogCategory, details?: any) => 
  createSystemLog({ message, category, severity: 'info', details });

export const logWarning = (message: string, category: LogCategory, details?: any) => 
  createSystemLog({ message, category, severity: 'warning', details });

export const logError = (message: string, category: LogCategory, details?: any) => 
  createSystemLog({ message, category, severity: 'error', details });

export const logCritical = (message: string, category: LogCategory, details?: any) => 
  createSystemLog({ message, category, severity: 'critical', details });

export default {
  createSystemLog,
  getSystemLogs,
  logInfo,
  logWarning,
  logError,
  logCritical
};
