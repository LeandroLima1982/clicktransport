
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logWarning, logInfo, logError } from '@/services/monitoring/systemLogService';
import { executeSQL } from '@/hooks/useAdminSql';

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
        
        // Delete financial metrics - use a more direct approach to avoid type issues
        const { error: financialMetricsError } = await supabase
          .from('financial_metrics')
          .delete()
          .not('id', 'is', null);
        
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
    await logError('Database cleanup failed', 'data-cleanup', error);
    return { success: false, error };
  }
};

/**
 * Executes a hard reset of database using direct SQL with TRUNCATE CASCADE 
 * to forcibly remove all data regardless of foreign key constraints
 */
export const forceCleanupAllData = async () => {
  try {
    logInfo('Starting forced cleanup with TRUNCATE CASCADE', 'data-cleanup');
    console.log('Executing forced database reset with TRUNCATE CASCADE...');
    
    // SQL command to forcibly reset the database regardless of constraints
    const sqlCommand = `
      -- Desativar triggers temporariamente
      SET session_replication_role = 'replica';
      
      -- Truncar tabelas de dados que não são essenciais ao sistema
      TRUNCATE driver_locations CASCADE;
      TRUNCATE driver_ratings CASCADE;
      TRUNCATE financial_metrics CASCADE;
      TRUNCATE service_orders CASCADE;
      TRUNCATE bookings CASCADE;
      TRUNCATE investor_company_shares CASCADE;
      
      -- Remover registros não-default das tabelas principais
      DELETE FROM drivers WHERE id != '00000000-0000-0000-0000-000000000000' AND id IS NOT NULL;
      DELETE FROM vehicles WHERE id != '00000000-0000-0000-0000-000000000000' AND id IS NOT NULL;
      DELETE FROM companies WHERE id != '00000000-0000-0000-0000-000000000000' AND id IS NOT NULL;
      DELETE FROM investors WHERE id IS NOT NULL;
      
      -- Reativar triggers
      SET session_replication_role = 'origin';
    `;
    
    try {
      // Execute the SQL command directly
      const { data, error } = await executeSQL(sqlCommand);
      
      if (error) {
        console.error('SQL execution error:', error);
        toast.error('Erro ao executar limpeza forçada', {
          description: error.message || 'Erro na execução SQL'
        });
        
        throw error;
      }
      
      console.log('Forced cleanup completed successfully:', data);
      toast.success('Limpeza completa executada com sucesso', {
        description: 'Todos os dados foram removidos.'
      });
      
      return { success: true, error: null };
    } catch (sqlError) {
      console.error('SQL execution failed:', sqlError);
      toast.error('Falha na execução SQL', {
        description: sqlError instanceof Error ? sqlError.message : 'Erro desconhecido'
      });
      
      throw sqlError;
    }
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
