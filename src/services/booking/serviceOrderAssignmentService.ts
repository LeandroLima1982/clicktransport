
import { supabase } from '@/integrations/supabase/client';
import { logInfo } from '../monitoring/systemLogService';

/**
 * Assign a driver to a service order
 */
export const assignDriverToOrder = async (orderId: string, driverId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned'
      })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    logInfo(`Driver assigned to service order`, 'service_order', {
      service_order_id: orderId,
      driver_id: driverId
    });
    
    return { success: true, serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error assigning driver to order:', error);
    return { success: false, serviceOrder: null, error };
  }
};
