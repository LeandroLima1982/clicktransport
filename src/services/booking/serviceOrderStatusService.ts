
import { supabase } from '@/integrations/supabase/client';
import { ServiceOrderStatus } from '@/types/serviceOrderInput';
import { logInfo, logError } from '../monitoring/systemLogService';

/**
 * Update the status of a service order
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: ServiceOrderStatus
) => {
  try {
    console.log(`Updating service order ${orderId} status to ${status}`);
    
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    logInfo(`Service order status updated to ${status}`, 'service_order', {
      order_id: orderId,
      status
    });
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error updating service order status:', error);
    logError('Failed to update service order status', 'service_order', {
      order_id: orderId,
      status,
      error: String(error)
    });
    return { success: false, data: null, error };
  }
};

/**
 * Fixes a service order if it's missing a company assignment
 */
export const fixServiceOrderCompanyAssignment = async (
  orderId: string, 
  companyId: string
) => {
  try {
    console.log(`Fixing service order ${orderId} company assignment to ${companyId}`);
    
    const { data, error } = await supabase
      .from('service_orders')
      .update({ company_id: companyId })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    logInfo('Service order company assignment fixed', 'service_order', {
      order_id: orderId,
      company_id: companyId
    });
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fixing service order company assignment:', error);
    return { success: false, data: null, error };
  }
};
