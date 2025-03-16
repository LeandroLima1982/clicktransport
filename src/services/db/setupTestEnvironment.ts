
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Cleans up existing test data from the database
 */
export const cleanDatabase = async () => {
  try {
    console.log('Cleaning up test data from database...');
    
    // Delete service orders first (due to foreign key constraints)
    const { error: ordersError } = await supabase
      .from('service_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (ordersError) throw ordersError;
    
    // Delete bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (bookingsError) throw bookingsError;
    
    // Delete drivers
    const { error: driversError } = await supabase
      .from('drivers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (driversError) throw driversError;
    
    // Delete vehicles
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (vehiclesError) throw vehiclesError;
    
    // Delete companies
    const { error: companiesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (companiesError) throw companiesError;
    
    console.log('Database cleaned successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error cleaning database:', error);
    return { success: false, error };
  }
};

/**
 * Sets up test companies with proper queue positions
 */
export const setupTestCompanies = async () => {
  try {
    console.log('Setting up test companies...');
    
    // Create first company - Rio Transfer
    const { data: company1, error: error1 } = await supabase
      .from('companies')
      .insert({
        name: 'Rio Transfer',
        cnpj: '12345678901234',
        status: 'active',
        queue_position: 1,
        last_order_assigned: null
      })
      .select()
      .single();
    
    if (error1) throw error1;
    
    // Create second company - Santos Express
    const { data: company2, error: error2 } = await supabase
      .from('companies')
      .insert({
        name: 'Santos Express',
        cnpj: '98765432109876',
        status: 'active',
        queue_position: 2,
        last_order_assigned: null
      })
      .select()
      .single();
    
    if (error2) throw error2;
    
    console.log('Test companies created:', company1.id, company2.id);
    return { 
      success: true, 
      companies: [company1, company2],
      error: null 
    };
  } catch (error) {
    console.error('Error setting up test companies:', error);
    return { success: false, companies: [], error };
  }
};

/**
 * Sets up test drivers for companies
 */
export const setupTestDrivers = async (companies: any[]) => {
  try {
    if (!companies || companies.length === 0) {
      throw new Error('No companies provided to create drivers');
    }
    
    console.log('Setting up test drivers...');
    const drivers = [];
    
    // Create 2 drivers for each company
    for (const company of companies) {
      // Driver 1
      const { data: driver1, error: error1 } = await supabase
        .from('drivers')
        .insert({
          name: `Motorista 1 - ${company.name}`,
          phone: '21999990000',
          license_number: 'CNH12345',
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error1) throw error1;
      drivers.push(driver1);
      
      // Driver 2
      const { data: driver2, error: error2 } = await supabase
        .from('drivers')
        .insert({
          name: `Motorista 2 - ${company.name}`,
          phone: '21888880000',
          license_number: 'CNH67890',
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error2) throw error2;
      drivers.push(driver2);
    }
    
    console.log(`Created ${drivers.length} test drivers`);
    return { success: true, drivers, error: null };
  } catch (error) {
    console.error('Error setting up test drivers:', error);
    return { success: false, drivers: [], error };
  }
};

/**
 * Sets up test vehicles for companies
 */
export const setupTestVehicles = async (companies: any[]) => {
  try {
    if (!companies || companies.length === 0) {
      throw new Error('No companies provided to create vehicles');
    }
    
    console.log('Setting up test vehicles...');
    const vehicles = [];
    
    // Create 2 vehicles for each company
    for (const company of companies) {
      // Vehicle 1
      const { data: vehicle1, error: error1 } = await supabase
        .from('vehicles')
        .insert({
          model: 'Toyota Corolla',
          license_plate: `ABC${Math.floor(1000 + Math.random() * 9000)}`,
          year: 2023,
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error1) throw error1;
      vehicles.push(vehicle1);
      
      // Vehicle 2
      const { data: vehicle2, error: error2 } = await supabase
        .from('vehicles')
        .insert({
          model: 'Honda Civic',
          license_plate: `XYZ${Math.floor(1000 + Math.random() * 9000)}`,
          year: 2022,
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error2) throw error2;
      vehicles.push(vehicle2);
    }
    
    console.log(`Created ${vehicles.length} test vehicles`);
    return { success: true, vehicles, error: null };
  } catch (error) {
    console.error('Error setting up test vehicles:', error);
    return { success: false, vehicles: [], error };
  }
};

/**
 * Main function to setup the test environment
 */
export const setupTestEnvironment = async () => {
  try {
    toast.info('Iniciando configuração do ambiente de teste...', { duration: 3000 });
    
    // Step 1: Clean the database
    const { success: cleanSuccess, error: cleanError } = await cleanDatabase();
    if (!cleanSuccess) {
      throw cleanError;
    }
    toast.success('Banco de dados limpo com sucesso', { duration: 2000 });
    
    // Step 2: Setup companies
    const { success: companiesSuccess, companies, error: companiesError } = await setupTestCompanies();
    if (!companiesSuccess || !companies) {
      throw companiesError;
    }
    toast.success(`${companies.length} empresas de teste criadas`, { duration: 2000 });
    
    // Step 3: Setup drivers
    const { success: driversSuccess, drivers, error: driversError } = await setupTestDrivers(companies);
    if (!driversSuccess) {
      throw driversError;
    }
    toast.success(`${drivers.length} motoristas de teste criados`, { duration: 2000 });
    
    // Step 4: Setup vehicles
    const { success: vehiclesSuccess, vehicles, error: vehiclesError } = await setupTestVehicles(companies);
    if (!vehiclesSuccess) {
      throw vehiclesError;
    }
    toast.success(`${vehicles.length} veículos de teste criados`, { duration: 2000 });
    
    toast.success('Ambiente de teste configurado com sucesso!', { 
      description: 'O sistema está pronto para testes de fluxo de trabalho.',
      duration: 5000
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up test environment:', error);
    toast.error('Erro ao configurar ambiente de teste', {
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, error };
  }
};

export default {
  cleanDatabase,
  setupTestCompanies,
  setupTestDrivers,
  setupTestVehicles,
  setupTestEnvironment
};
