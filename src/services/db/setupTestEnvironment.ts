
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logInfo, logWarning, logError } from '@/services/monitoring/systemLogService';
import { cleanupAllTestData } from './cleanupTestData';

/**
 * Cleans up existing test data from the database
 */
export const cleanDatabase = async () => {
  try {
    console.log('Cleaning up test data from database...');
    
    // Call our comprehensive cleanup function
    const cleanupResult = await cleanupAllTestData();
    if (!cleanupResult.success) {
      throw cleanupResult.error || new Error('Failed to clean database');
    }
    
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
    
    // Create drivers for each company
    for (const company of companies) {
      // Driver 1
      const { data: driver1, error: error1 } = await supabase
        .from('drivers')
        .insert({
          name: `Motorista 1 - ${company.name}`,
          phone: '21999990000',
          license_number: `CNH-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active',
          company_id: company.id,
          email: `driver1.${company.id.substring(0, 5)}@example.com`
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
          license_number: `CNH-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active',
          company_id: company.id,
          email: `driver2.${company.id.substring(0, 5)}@example.com`
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
    
    // Create vehicles for each company
    for (const company of companies) {
      // Vehicle 1 - Sedan
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
      
      // Vehicle 2 - SUV
      const { data: vehicle2, error: error2 } = await supabase
        .from('vehicles')
        .insert({
          model: 'Honda CR-V',
          license_plate: `XYZ${Math.floor(1000 + Math.random() * 9000)}`,
          year: 2022,
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error2) throw error2;
      vehicles.push(vehicle2);
      
      // Vehicle 3 - Van (for larger groups)
      const { data: vehicle3, error: error3 } = await supabase
        .from('vehicles')
        .insert({
          model: 'Mercedes-Benz Sprinter',
          license_plate: `VAN${Math.floor(1000 + Math.random() * 9000)}`,
          year: 2021,
          status: 'active',
          company_id: company.id
        })
        .select()
        .single();
      
      if (error3) throw error3;
      vehicles.push(vehicle3);
    }
    
    console.log(`Created ${vehicles.length} test vehicles`);
    return { success: true, vehicles, error: null };
  } catch (error) {
    console.error('Error setting up test vehicles:', error);
    return { success: false, vehicles: [], error };
  }
};

/**
 * Create a sample booking - revised version that doesn't try to create a profile
 */
export const createSampleBooking = async () => {
  try {
    console.log('Creating sample booking...');
    
    // Generate a random UUID for the test booking
    // We've removed the profile creation part as it causes foreign key constraint issues
    const testUserId = crypto.randomUUID();
    
    const bookingData = {
      reference_code: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'confirmed',
      origin: 'Aeroporto do Galeão, Rio de Janeiro',
      destination: 'Copacabana Palace Hotel, Rio de Janeiro',
      travel_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      booking_date: new Date().toISOString(),
      total_price: 150.00,
      passengers: 2,
      user_id: testUserId,
      additional_notes: 'Cliente solicitou motorista que fale inglês'
    };
    
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (error) {
        console.log('Error creating test booking:', error);
        // Return partial success since this isn't essential
        return { 
          success: false, 
          booking: null, 
          error: new Error('Não foi possível criar uma reserva de teste, mas as empresas, motoristas e veículos foram configurados.') 
        };
      }
      
      console.log('Sample booking created:', booking);
      return { success: true, booking, error: null };
    } catch (error) {
      console.log('Exception creating test booking:', error);
      // Return partial success since this isn't essential
      return { 
        success: false, 
        booking: null, 
        error: new Error('Não foi possível criar uma reserva de teste, mas as empresas, motoristas e veículos foram configurados.') 
      };
    }
  } catch (error) {
    console.error('Error in createSampleBooking:', error);
    // Return partial success since this isn't essential
    return { 
      success: false, 
      booking: null, 
      error: new Error('Não foi possível criar uma reserva de teste, mas as empresas, motoristas e veículos foram configurados.') 
    };
  }
};

/**
 * Main function to setup the test environment
 */
export const setupTestEnvironment = async () => {
  try {
    logInfo('Starting test environment setup...', 'test-environment');
    toast.info('Iniciando configuração do ambiente de teste...', { duration: 3000 });
    
    // Step 1: Clean the database using our thorough cleanup function
    const { success: cleanSuccess, error: cleanError } = await cleanDatabase();
    if (!cleanSuccess) {
      logError('Database cleanup failed', 'test-environment', cleanError);
      throw cleanError || new Error('Falha ao limpar o banco de dados');
    }
    logInfo('Database cleaned successfully', 'test-environment');
    toast.success('Banco de dados limpo com sucesso', { duration: 2000 });
    
    // Step 2: Setup companies
    const { success: companiesSuccess, companies, error: companiesError } = await setupTestCompanies();
    if (!companiesSuccess || !companies || companies.length === 0) {
      logError('Failed to create test companies', 'test-environment', companiesError);
      throw companiesError || new Error('Falha ao criar empresas de teste');
    }
    logInfo(`${companies.length} test companies created`, 'test-environment');
    toast.success(`${companies.length} empresas de teste criadas`, { duration: 2000 });
    
    // Step 3: Setup drivers
    const { success: driversSuccess, drivers, error: driversError } = await setupTestDrivers(companies);
    if (!driversSuccess || !drivers || drivers.length === 0) {
      logError('Failed to create test drivers', 'test-environment', driversError);
      throw driversError || new Error('Falha ao criar motoristas de teste');
    }
    logInfo(`${drivers.length} test drivers created`, 'test-environment');
    toast.success(`${drivers.length} motoristas de teste criados`, { duration: 2000 });
    
    // Step 4: Setup vehicles
    const { success: vehiclesSuccess, vehicles, error: vehiclesError } = await setupTestVehicles(companies);
    if (!vehiclesSuccess || !vehicles || vehicles.length === 0) {
      logError('Failed to create test vehicles', 'test-environment', vehiclesError);
      throw vehiclesError || new Error('Falha ao criar veículos de teste');
    }
    logInfo(`${vehicles.length} test vehicles created`, 'test-environment');
    toast.success(`${vehicles.length} veículos de teste criados`, { duration: 2000 });
    
    // Step 5: Try to create a sample booking, but treat it as optional
    const { success: bookingSuccess, booking, error: bookingError } = await createSampleBooking();
    if (!bookingSuccess) {
      logWarning('Failed to create sample booking, but continuing with setup', 'test-environment', bookingError);
      toast.warning('Não foi possível criar reserva de teste, mas o ambiente foi configurado', { 
        description: 'Você pode gerar reservas na aba "Gerar Dados"',
        duration: 3000
      });
    } else {
      logInfo('Test booking created', 'test-environment');
      toast.success('Reserva de teste criada', { duration: 2000 });
    }
    
    logInfo('Test environment setup completed successfully', 'test-environment');
    toast.success('Ambiente de teste configurado com sucesso!', { 
      description: 'O sistema está pronto para testes de fluxo de trabalho.',
      duration: 5000
    });
    
    return { 
      success: true,
      companies,
      drivers,
      vehicles,
      booking
    };
  } catch (error) {
    logError('Test environment setup failed', 'test-environment', error);
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
  createSampleBooking,
  setupTestEnvironment
};
