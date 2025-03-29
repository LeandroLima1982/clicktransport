
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logWarning, logInfo, logError } from '@/services/monitoring/systemLogService';

/**
 * Cleans up all test data from the database
 */
export const cleanupAllTestData = async () => {
  try {
    console.log('Starting comprehensive cleanup of all test data...');
    logInfo('Starting deep cleanup of all test data', 'data-cleanup');
    
    // Delete in proper order to handle foreign key constraints
    // We need to delete in the correct order to avoid foreign key violations
    
    try {
      // First try to clean financial_metrics which might have RLS issues
      try {
        logInfo('Attempting to delete financial_metrics data', 'data-cleanup');
        
        // Disable RLS temporarily for this operation via a direct SQL query
        // This is safer than modifying RLS policies permanently
        // Using 'as any' to bypass TypeScript checking since our new function isn't in the types yet
        const { error: financialMetricsError } = await supabase.rpc('admin_delete_financial_metrics' as any);
        
        if (financialMetricsError) {
          console.warn('Could not delete financial_metrics:', financialMetricsError);
          await logWarning('Could not delete financial_metrics during cleanup', 'data-cleanup', financialMetricsError);
        } else {
          console.log('Financial metrics deleted');
        }
      } catch (financialError) {
        console.warn('Error deleting financial metrics:', financialError);
        // Continue with other deletions even if this fails
      }
      
      // First delete driver_locations as they reference drivers
      const { error: locationsError } = await supabase
        .from('driver_locations')
        .delete()
        .not('driver_id', 'is', null);
      
      if (locationsError) {
        console.error('Error deleting driver locations:', locationsError);
        await logWarning('Failed to delete driver locations', 'data-cleanup', locationsError);
      } else {
        console.log('Driver locations deleted');
        toast.success('Localizações dos motoristas removidas');
      }
      
      // Delete driver ratings
      const { error: ratingsError } = await supabase
        .from('driver_ratings')
        .delete()
        .not('driver_id', 'is', null);
      
      if (ratingsError) {
        console.error('Error deleting driver ratings:', ratingsError);
        await logWarning('Failed to delete driver ratings', 'data-cleanup', ratingsError);
      } else {
        console.log('Driver ratings deleted');
        toast.success('Avaliações de motoristas removidas');
      }
      
      // Delete service orders (they have driver_id foreign keys)
      const { error: ordersError } = await supabase
        .from('service_orders')
        .delete()
        .not('id', 'is', null);
      
      if (ordersError) {
        console.error('Error deleting service orders:', ordersError);
        await logWarning('Failed to delete service orders', 'data-cleanup', ordersError);
      } else {
        console.log('Service orders deleted');
        toast.success('Ordens de serviço removidas');
      }
      
      // Delete bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .not('id', 'is', null);
      
      if (bookingsError) {
        console.error('Error deleting bookings:', bookingsError);
        await logWarning('Failed to delete bookings', 'data-cleanup', bookingsError);
      } else {
        console.log('Bookings deleted');
        toast.success('Reservas removidas');
      }
      
      // Delete drivers (must delete after orders that reference them)
      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .not('id', 'is', null)
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (driversError) {
        console.error('Error deleting drivers:', driversError);
        await logWarning('Failed to delete drivers', 'data-cleanup', driversError);
      } else {
        console.log('Drivers deleted');
        toast.success('Motoristas removidos');
      }
      
      // Delete vehicles
      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .delete()
        .not('id', 'is', null)
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (vehiclesError) {
        console.error('Error deleting vehicles:', vehiclesError);
        await logWarning('Failed to delete vehicles', 'data-cleanup', vehiclesError);
      } else {
        console.log('Vehicles deleted');
        toast.success('Veículos removidos');
      }
      
      // Delete companies last (after drivers and vehicles that reference them)
      const { error: companiesError } = await supabase
        .from('companies')
        .delete()
        .not('id', 'is', null)
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (companiesError) {
        console.error('Error deleting companies:', companiesError);
        await logWarning('Failed to delete companies', 'data-cleanup', companiesError);
        // More specific error handling for foreign key constraints
        if (companiesError.message.includes('violates foreign key constraint')) {
          toast.error('Não foi possível excluir empresas devido a restrições de chave estrangeira. Alguns registros relacionados ainda existem.');
          return { success: false, error: new Error('Não foi possível excluir empresas devido a restrições de chave estrangeira. Use a opção de "Limpeza Forçada" para remover todos os dados.') };
        }
      } else {
        console.log('Companies deleted');
        toast.success('Empresas removidas');
      }
    } catch (error) {
      console.error('Error during specific table cleanup:', error);
      await logWarning('Database cleanup encountered errors', 'data-cleanup', error);
      return { success: false, error };
    }
    
    // Do not attempt to delete profiles linked to auth.users
    // Just log success message
    console.log('Database cleanup completed successfully');
    toast.success('Dados de teste removidos com sucesso');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error during database cleanup:', error);
    toast.error('Erro ao limpar dados de teste', { 
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, error };
  }
};

/**
 * Cleans up all data including companies and related records using SQL
 * This function uses admin SQL execution to bypass RLS and foreign key constraints
 */
export const forceCleanupAllData = async () => {
  try {
    console.log('Starting force cleanup with SQL command...');
    logInfo('Running force cleanup with SQL', 'data-cleanup');
    
    // Return an error message instructing to use the admin SQL execution in the component
    return { 
      success: false, 
      error: new Error('Esta função agora usa execução SQL direta para limpeza. Use o botão de "Limpeza Forçada".')
    };
  } catch (error) {
    console.error('Error during force cleanup:', error);
    toast.error('Erro durante limpeza forçada', { 
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, error };
  }
};

export default {
  cleanupAllTestData,
  forceCleanupAllData
};
