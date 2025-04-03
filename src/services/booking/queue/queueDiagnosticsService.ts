
import { supabase } from '@/integrations/supabase/client';
import { getSystemLogs } from '../../monitoring/systemLogService';

/**
 * Gets diagnostic data about the queue and recent orders
 */
export const getQueueDiagnostics = async () => {
  try {
    // Get companies statistics
    const [
      allCompaniesResult,
      activeCompaniesResult,
      zeroPositionResult,
      nullPositionResult,
      recentOrdersResult,
      pendingBookingsResult
    ] = await Promise.all([
      // Get total company count
      supabase.from('companies').select('id', { count: 'exact' }),
      
      // Get active company count
      supabase.from('companies').select('id', { count: 'exact' }).eq('status', 'active'),
      
      // Get companies with position 0
      supabase.from('companies').select('id', { count: 'exact' }).eq('queue_position', 0),
      
      // Get companies with null position
      supabase.from('companies').select('id', { count: 'exact' }).is('queue_position', null),
      
      // Get recent orders
      supabase.from('service_orders').select('*').order('created_at', { ascending: false }).limit(5),
      
      // Get pending bookings not assigned to service orders
      supabase.from('bookings').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5)
    ]);
    
    if (allCompaniesResult.error) throw allCompaniesResult.error;
    if (activeCompaniesResult.error) throw activeCompaniesResult.error;
    if (zeroPositionResult.error) throw zeroPositionResult.error;
    if (nullPositionResult.error) throw nullPositionResult.error;
    if (recentOrdersResult.error) throw recentOrdersResult.error;
    if (pendingBookingsResult.error) throw pendingBookingsResult.error;
    
    // Get recent logs
    const { logs: recentLogs } = await getSystemLogs({ 
      category: 'queue', 
      limit: 5 
    });
    
    return {
      success: true,
      data: {
        queue_status: {
          total_companies: allCompaniesResult.count || 0,
          active_companies: activeCompaniesResult.count || 0,
          zero_queue_position_count: zeroPositionResult.count || 0,
          null_queue_position_count: nullPositionResult.count || 0,
        },
        recentOrders: recentOrdersResult.data || [],
        pendingBookings: pendingBookingsResult.data || [],
        recentLogs: recentLogs || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting queue diagnostics:', error);
    return { success: false, data: null, error };
  }
};
