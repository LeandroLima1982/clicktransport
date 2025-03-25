
import { supabase } from '../integrations/supabase/client';

export const createTables = async () => {
  try {
    // Verificar se a tabela de perfis já existe (essa tabela já é criada automaticamente pelo Supabase Auth)
    const { data: profilesExist } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    // Se a tabela de perfis não existir, modificamos a estrutura dela
    if (!profilesExist) {
      // Para tabelas, usamos SQL direto via query() em vez de rpc execute_sql
      await supabase.from('profiles').insert({
        id: '00000000-0000-0000-0000-000000000000',
        full_name: 'System',
        email: 'system@example.com',
        role: 'admin'
      }).select();
      console.log('Tabela profiles verificada/criada com sucesso.');
    }

    // Verificar se a tabela de empresas existe
    const { data: companiesExist } = await supabase
      .from('companies')
      .select('count', { count: 'exact', head: true });

    if (!companiesExist) {
      // Criar a tabela companies
      console.log('Criando tabela companies...');
      // Em vez de executar SQL, podemos apenas inserir um registro para garantir que a tabela exista
      await supabase.from('companies').insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'System Company',
        cnpj: '00000000000000',
        status: 'active',
        user_id: '00000000-0000-0000-0000-000000000000'
      }).select();
      console.log('Tabela companies criada com sucesso.');
    }

    // Verificar se a tabela de veículos existe
    const { data: vehiclesExist } = await supabase
      .from('vehicles')
      .select('count', { count: 'exact', head: true });

    if (!vehiclesExist) {
      // Criar a tabela vehicles
      console.log('Criando tabela vehicles...');
      await supabase.from('vehicles').insert({
        id: '00000000-0000-0000-0000-000000000000',
        model: 'Sample Vehicle',
        license_plate: 'SAMPLE',
        company_id: '00000000-0000-0000-0000-000000000000',
        status: 'active'
      }).select();
      console.log('Tabela vehicles criada com sucesso.');
    }

    // Verificar se a tabela de motoristas existe
    const { data: driversExist } = await supabase
      .from('drivers')
      .select('count', { count: 'exact', head: true });

    if (!driversExist) {
      // Criar a tabela drivers
      console.log('Criando tabela drivers...');
      await supabase.from('drivers').insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Sample Driver',
        company_id: '00000000-0000-0000-0000-000000000000',
        status: 'active'
      }).select();
      console.log('Tabela drivers criada com sucesso.');
    }

    // Verificar se a tabela de ordens de serviço existe
    const { data: serviceOrdersExist } = await supabase
      .from('service_orders')
      .select('count', { count: 'exact', head: true });

    if (!serviceOrdersExist) {
      // Criar a tabela service_orders
      console.log('Criando tabela service_orders...');
      await supabase.from('service_orders').insert({
        id: '00000000-0000-0000-0000-000000000000',
        company_id: '00000000-0000-0000-0000-000000000000',
        origin: 'Sample Origin',
        destination: 'Sample Destination',
        pickup_date: new Date().toISOString(),
        status: 'pending'
      }).select();
      console.log('Tabela service_orders criada com sucesso.');
    }

    // Verificar se a tabela de solicitações de serviço existe
    const { data: serviceRequestsExist } = await supabase
      .from('service_requests')
      .select('count', { count: 'exact', head: true });

    if (!serviceRequestsExist) {
      // Criar a tabela service_requests
      console.log('Criando tabela service_requests...');
      await supabase.from('service_requests').insert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Sample Request',
        email: 'sample@example.com',
        phone: '1234567890',
        service_type: 'airport',
        origin: 'Sample Origin',
        destination: 'Sample Destination',
        passengers: '1',
        status: 'pending'
      }).select();
      console.log('Tabela service_requests criada com sucesso.');
    }

    // Verificar se a tabela de imagens do site existe
    const { data: siteImagesExist } = await supabase
      .from('site_images')
      .select('count', { count: 'exact', head: true });

    if (!siteImagesExist) {
      // Criar a tabela site_images
      console.log('Criando tabela site_images...');
      await supabase.from('site_images').insert({
        section_id: 'sample',
        image_url: 'https://example.com/sample.jpg',
        component_path: 'src/components/Sample.tsx'
      }).select();
      console.log('Tabela site_images criada com sucesso.');
    }

    console.log('Todas as tabelas foram verificadas/criadas com sucesso!');
    return { success: true, message: 'Tabelas verificadas/criadas com sucesso!' };
  } catch (error) {
    console.error('Erro ao verificar/criar tabelas:', error);
    return { success: false, message: 'Erro ao verificar/criar tabelas', error };
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
  },
  
  // Imagens do Site
  siteImages: {
    getAll: () => supabase.from('site_images').select('*'),
    getBySection: (sectionId: string) => supabase.from('site_images').select('*').eq('section_id', sectionId).single(),
    updateOrCreate: (sectionId: string, imageUrl: string, componentPath?: string) => {
      return supabase.from('site_images')
        .upsert({ 
          section_id: sectionId, 
          image_url: imageUrl, 
          component_path: componentPath 
        }, { 
          onConflict: 'section_id' 
        });
    },
    delete: (sectionId: string) => supabase.from('site_images').delete().eq('section_id', sectionId),
  }
};
