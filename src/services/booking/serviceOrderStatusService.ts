
import { supabase } from '@/integrations/supabase/client';
import { ServiceOrderStatus, ServiceOrderStatusUpdate } from '@/types/serviceOrderInput';
import { logInfo } from '../monitoring/systemLogService';

/**
 * Update the status of a service order
 */
export const updateOrderStatus = async (orderId: string, status: ServiceOrderStatus) => {
  try {
    // Use the explicitly typed ServiceOrderStatusUpdate
    const updates: ServiceOrderStatusUpdate = { 
      status
    };
    
    if (status === 'completed') {
      updates.delivery_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('service_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    logInfo(`Service order status updated to ${status}`, 'service_order', {
      service_order_id: orderId,
      new_status: status
    });
    
    return { success: true, serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error updating service order status:', error);
    return { success: false, serviceOrder: null, error };
  }
};
