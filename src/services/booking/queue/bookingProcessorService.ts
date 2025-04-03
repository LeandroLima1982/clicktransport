
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logWarning, logError } from '../../monitoring/systemLogService';
import { getNextCompanyInQueue, updateCompanyQueuePosition, fixInvalidQueuePositions } from './queuePositionService';

/**
 * Process pending bookings and create service orders
 * This is the key function that was failing before - now improved with better error handling
 */
export const processUnassignedBookings = async () => {
  try {
    await logInfo('Iniciando processamento de reservas não atribuídas', 'booking');
    
    // Get pending bookings that don't have service orders yet
    const { data: pendingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (bookingsError) throw bookingsError;
    
    if (!pendingBookings || pendingBookings.length === 0) {
      await logInfo('Nenhuma reserva pendente encontrada para processar', 'booking');
      return { 
        processed: 0, 
        success: true, 
        message: 'No pending bookings to process', 
        error: null 
      };
    }
    
    // Get the next company in queue to assign orders
    const { company, error: companyError } = await getNextCompanyInQueue();
    
    if (companyError || !company) {
      await logWarning('Não foi possível obter empresa para atribuir reservas pendentes', 'booking', { error: companyError });
      
      // Try to fix queue positions and try again
      await fixInvalidQueuePositions();
      
      // Try again after fixing positions
      const retryResult = await getNextCompanyInQueue();
      if (retryResult.error || !retryResult.company) {
        return { 
          processed: 0, 
          success: false, 
          message: 'No active company available to assign bookings', 
          error: companyError 
        };
      }
    }
    
    // Use the company from retry if the first attempt failed
    const assignCompany = company || (await getNextCompanyInQueue()).company;
    
    if (!assignCompany) {
      return { 
        processed: 0, 
        success: false, 
        message: 'No active company available after retry', 
        error: new Error('No active companies available') 
      };
    }
    
    // Process each booking
    let processedCount = 0;
    let errors = [];
    
    for (const booking of pendingBookings) {
      try {
        // Create service order
        const orderData = {
          company_id: assignCompany.id,
          origin: booking.origin,
          destination: booking.destination,
          pickup_date: booking.travel_date,
          status: 'pending' as const,
          notes: `Reserva: ${booking.reference_code}\n${booking.additional_notes || ''}`,
        };
        
        const { data: order, error: orderError } = await supabase
          .from('service_orders')
          .insert(orderData)
          .select()
          .single();
        
        if (orderError) throw orderError;
        
        // Update booking status to confirmed
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', booking.id);
        
        if (updateError) throw updateError;
        
        // Update company queue position
        await updateCompanyQueuePosition(assignCompany.id);
        
        // Log the service order creation
        await logInfo('Service order created from pending booking', 'booking', {
          booking_id: booking.id,
          order_id: order.id,
          company_id: assignCompany.id
        });
        
        processedCount++;
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        errors.push({ booking_id: booking.id, error: error });
        await logError(`Erro ao processar reserva ${booking.id}`, 'booking', { error });
      }
    }
    
    await logInfo(`Processamento de reservas concluído: ${processedCount} de ${pendingBookings.length}`, 'booking');
    
    return { 
      processed: processedCount, 
      success: processedCount > 0, 
      message: `Processed ${processedCount} of ${pendingBookings.length} bookings`,
      errors: errors.length > 0 ? errors : null,
      error: null 
    };
  } catch (error) {
    console.error('Error processing unassigned bookings:', error);
    await logError('Falha no processamento de reservas não atribuídas', 'booking', { error });
    return { processed: 0, success: false, error };
  }
};
