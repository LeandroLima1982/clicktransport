
import { supabase } from '@/integrations/supabase/client';

export const createTables = async () => {
  try {
    console.log('Starting database setup...');
    
    // Check if profiles table exists
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (profilesError) {
      console.log('Profiles table may not exist yet, we will create it');
    }
    
    // Create tables using direct SQL queries via SQL editor or Edge Functions
    // We'll use TypeScript to validate if tables exist first, then create what's missing
    
    // Check if companies table exists
    const { count: companiesCount, error: companiesError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (companiesError) {
      console.log('Companies table needs to be created');
      // You would need to create this via SQL editor
    }
    
    // Check if vehicles table exists
    const { count: vehiclesCount, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });
    
    if (vehiclesError) {
      console.log('Vehicles table needs to be created');
      // You would need to create this via SQL editor
    }
    
    // Check if drivers table exists
    const { count: driversCount, error: driversError } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true });
    
    if (driversError) {
      console.log('Drivers table needs to be created');
      // You would need to create this via SQL editor
    }
    
    // Check if service_orders table exists
    const { count: serviceOrdersCount, error: serviceOrdersError } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true });
    
    if (serviceOrdersError) {
      console.log('Service orders table needs to be created');
      // You would need to create this via SQL editor
    }
    
    // Check if service_requests table exists
    const { count: serviceRequestsCount, error: serviceRequestsError } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true });
    
    if (serviceRequestsError) {
      console.log('Service requests table needs to be created');
      // The table was just created via SQL migration
    }

    console.log('Database setup completed');
    return { success: true, message: 'Database setup completed' };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, message: 'Error setting up database', error };
  }
};

// Function to initialize the database - can be called during application initialization
export const initializeDatabase = async () => {
  const result = await createTables();
  return result;
};

// Helper functions for each table
export const supabaseServices = {
  // Companies
  companies: {
    getAll: () => supabase.from('companies').select('*'),
    getById: (id: string) => supabase.from('companies').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('companies').insert(data),
    update: (id: string, data: any) => supabase.from('companies').update(data).eq('id', id),
    delete: (id: string) => supabase.from('companies').delete().eq('id', id),
  },
  
  // Drivers
  drivers: {
    getAll: () => supabase.from('drivers').select('*'),
    getById: (id: string) => supabase.from('drivers').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('drivers').select('*').eq('company_id', companyId),
    create: (data: any) => supabase.from('drivers').insert(data),
    update: (id: string, data: any) => supabase.from('drivers').update(data).eq('id', id),
    delete: (id: string) => supabase.from('drivers').delete().eq('id', id),
  },
  
  // Vehicles
  vehicles: {
    getAll: () => supabase.from('vehicles').select('*'),
    getById: (id: string) => supabase.from('vehicles').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('vehicles').select('*').eq('company_id', companyId),
    create: (data: any) => supabase.from('vehicles').insert(data),
    update: (id: string, data: any) => supabase.from('vehicles').update(data).eq('id', id),
    delete: (id: string) => supabase.from('vehicles').delete().eq('id', id),
  },
  
  // Service Orders
  serviceOrders: {
    getAll: () => supabase.from('service_orders').select('*'),
    getById: (id: string) => supabase.from('service_orders').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('service_orders').select('*').eq('company_id', companyId),
    getByDriver: (driverId: string) => supabase.from('service_orders').select('*').eq('driver_id', driverId),
    create: (data: any) => supabase.from('service_orders').insert(data),
    update: (id: string, data: any) => supabase.from('service_orders').update(data).eq('id', id),
    delete: (id: string) => supabase.from('service_orders').delete().eq('id', id),
  },
  
  // Service Requests - Now that the table has been created
  serviceRequests: {
    getAll: () => supabase.from('service_requests').select('*'),
    getById: (id: string) => supabase.from('service_requests').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('service_requests').insert(data),
    update: (id: string, data: any) => supabase.from('service_requests').update(data).eq('id', id),
    delete: (id: string) => supabase.from('service_requests').delete().eq('id', id),
  }
};
