import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofctyafulvkwaldondsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY3R5YWZ1bHZrd2FsZG9uZHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTc1NDksImV4cCI6MjA1NzEzMzU0OX0.tu9XJ07Y2HLDX5LKQDDL_Tjr_lPLcwypE0c0Zzrhggw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const initializeSupabase = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return false;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get user role from profiles
export const getUserRole = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (error) throw error;
    
    return data?.role;
  } catch (error) {
    console.error('Erro ao obter papel do usuário:', error);
    return null;
  }
};
