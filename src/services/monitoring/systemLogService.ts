
import { supabase } from '@/integrations/supabase/client';

// Severity levels
type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

// Log categories
type LogCategory = 'queue' | 'order' | 'driver' | 'company' | 'system' | 'notification';

// Log entry interface
interface SystemLog {
  id?: string;
  message: string;
  details?: any;
  category: LogCategory;
  severity: LogSeverity;
  created_at?: string;
}

/**
 * Base logging function
 */
const logEntry = async (
  message: string,
  category: LogCategory,
  severity: LogSeverity,
  details?: any
) => {
  try {
    const logData = {
      message,
      category,
      severity,
      details: details ? JSON.stringify(details) : '{}'
    };

    const { data, error } = await supabase
      .from('system_logs')
      .insert(logData);

    if (error) {
      console.error('Error logging to system_logs:', error);
    }
    
    return { success: !error, error };
  } catch (error) {
    console.error('Exception logging to system_logs:', error);
    return { success: false, error };
  }
};

/**
 * Log an info message
 */
export const logInfo = (message: string, category: LogCategory, details?: any) => {
  console.info(`[INFO][${category}] ${message}`, details);
  return logEntry(message, category, 'info', details);
};

/**
 * Log a warning message
 */
export const logWarning = (message: string, category: LogCategory, details?: any) => {
  console.warn(`[WARNING][${category}] ${message}`, details);
  return logEntry(message, category, 'warning', details);
};

/**
 * Log an error message
 */
export const logError = (message: string, category: LogCategory, details?: any) => {
  console.error(`[ERROR][${category}] ${message}`, details);
  return logEntry(message, category, 'error', details);
};

/**
 * Log a critical message
 */
export const logCritical = (message: string, category: LogCategory, details?: any) => {
  console.error(`[CRITICAL][${category}] ${message}`, details);
  return logEntry(message, category, 'critical', details);
};

/**
 * Get system logs with filtering options
 */
export const getSystemLogs = async ({
  category,
  severity,
  limit = 100,
  offset = 0,
  startDate,
  endDate
}: {
  category?: LogCategory;
  severity?: LogSeverity;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (severity) {
      query = query.eq('severity', severity);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Parse JSON details
    const logsWithParsedDetails = data?.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    }));
    
    return { 
      logs: logsWithParsedDetails || [],
      count: count || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return { logs: [], count: 0, error };
  }
};

export default {
  logInfo,
  logWarning,
  logError,
  logCritical,
  getSystemLogs
};
