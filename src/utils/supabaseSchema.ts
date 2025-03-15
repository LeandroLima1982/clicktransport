import { supabase } from '../main';

export const createTables = async () => {
  try {
    // Verificar se a tabela de perfis já existe (essa tabela já é criada automaticamente pelo Supabase Auth)
    const { data: profilesExist } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    // Se a tabela de perfis não existir, modificamos a estrutura dela
    if (!profilesExist) {
      // Tabela 1: Usuários/Perfis (extendendo a tabela de perfis criada pelo Supabase Auth)
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            full_name TEXT,
            email TEXT UNIQUE,
            role TEXT CHECK (role IN ('admin', 'company', 'driver')),
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
    }

    // Tabela 2: Empresas de Transporte
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.companies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          cnpj TEXT UNIQUE NOT NULL,
          phone TEXT,
          status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE
        );
      `
    });

    // Tabela 3: Veículos
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.vehicles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          model TEXT NOT NULL,
          license_plate TEXT UNIQUE NOT NULL,
          year INTEGER,
          company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
          status TEXT CHECK (status IN ('active', 'maintenance', 'inactive')) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    // Tabela 4: Motoristas
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.drivers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          phone TEXT,
          license_number TEXT,
          company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
          vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
          status TEXT CHECK (status IN ('active', 'inactive', 'on_trip')) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    // Tabela 5: Ordens de Serviço
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.service_orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
          driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
          vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          pickup_date TIMESTAMP WITH TIME ZONE,
          delivery_date TIMESTAMP WITH TIME ZONE,
          status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    // Tabela para solicitações de serviço (service_requests)
    await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS public.service_requests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          service_type TEXT NOT NULL,
          origin TEXT NOT NULL,
          destination TEXT NOT NULL,
          passengers TEXT NOT NULL,
          request_date TEXT,
          additional_info TEXT,
          status TEXT CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')) DEFAULT 'pending',
          company_id UUID REFERENCES public.companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    console.log('Todas as tabelas foram criadas com sucesso!');
    return { success: true, message: 'Tabelas criadas com sucesso!' };
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return { success: false, message: 'Erro ao criar tabelas', error };
  }
};

// Função para inicializar o banco de dados - pode ser chamada durante a inicialização da aplicação
export const initializeDatabase = async () => {
  const result = await createTables();
  return result;
};

// Funções helper para cada tabela
export const supabaseServices = {
  // Empresas
  companies: {
    getAll: () => supabase.from('companies').select('*'),
    getById: (id: string) => supabase.from('companies').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('companies').insert(data),
    update: (id: string, data: any) => supabase.from('companies').update(data).eq('id', id),
    delete: (id: string) => supabase.from('companies').delete().eq('id', id),
  },
  
  // Motoristas
  drivers: {
    getAll: () => supabase.from('drivers').select('*'),
    getById: (id: string) => supabase.from('drivers').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('drivers').select('*').eq('company_id', companyId),
    create: (data: any) => supabase.from('drivers').insert(data),
    update: (id: string, data: any) => supabase.from('drivers').update(data).eq('id', id),
    delete: (id: string) => supabase.from('drivers').delete().eq('id', id),
  },
  
  // Veículos
  vehicles: {
    getAll: () => supabase.from('vehicles').select('*'),
    getById: (id: string) => supabase.from('vehicles').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('vehicles').select('*').eq('company_id', companyId),
    create: (data: any) => supabase.from('vehicles').insert(data),
    update: (id: string, data: any) => supabase.from('vehicles').update(data).eq('id', id),
    delete: (id: string) => supabase.from('vehicles').delete().eq('id', id),
  },
  
  // Ordens de Serviço
  serviceOrders: {
    getAll: () => supabase.from('service_orders').select('*'),
    getById: (id: string) => supabase.from('service_orders').select('*').eq('id', id).single(),
    getByCompany: (companyId: string) => supabase.from('service_orders').select('*').eq('company_id', companyId),
    getByDriver: (driverId: string) => supabase.from('service_orders').select('*').eq('driver_id', driverId),
    create: (data: any) => supabase.from('service_orders').insert(data),
    update: (id: string, data: any) => supabase.from('service_orders').update(data).eq('id', id),
    delete: (id: string) => supabase.from('service_orders').delete().eq('id', id),
  },
  
  // Solicitações de Serviço
  serviceRequests: {
    getAll: () => supabase.from('service_requests').select('*'),
    getById: (id: string) => supabase.from('service_requests').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('service_requests').insert(data),
    update: (id: string, data: any) => supabase.from('service_requests').update(data).eq('id', id),
    delete: (id: string) => supabase.from('service_requests').delete().eq('id', id),
  }
};
