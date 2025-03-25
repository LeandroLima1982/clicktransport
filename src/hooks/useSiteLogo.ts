
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoData {
  light: string | null;
  dark: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useSiteLogo = () => {
  const [logoData, setLogoData] = useState<LogoData>({
    light: null,
    dark: null,
    isLoading: true,
    error: null
  });
  const [refreshKey, setRefreshKey] = useState(0); // Chave para forçar atualizações

  const fetchLogos = useCallback(async () => {
    try {
      setLogoData(prev => ({ ...prev, isLoading: true }));
      
      // Limpar o cache do navegador para as URLs das logos (timestamp approach)
      const timestamp = new Date().getTime();
      
      // Buscar logo para modo claro
      const { data: lightLogoData, error: lightError } = await supabase
        .from('site_logos')
        .select('logo_url, updated_at')
        .eq('mode', 'light')
        .maybeSingle();
      
      // Buscar logo para modo escuro
      const { data: darkLogoData, error: darkError } = await supabase
        .from('site_logos')
        .select('logo_url, updated_at')
        .eq('mode', 'dark')
        .maybeSingle();
      
      if (lightError && lightError.code !== 'PGRST116') throw lightError;
      if (darkError && darkError.code !== 'PGRST116') throw darkError;
      
      // Adicionar timestamp às URLs para evitar cache
      const lightUrl = lightLogoData?.logo_url ? `${lightLogoData.logo_url}?t=${timestamp}` : null;
      const darkUrl = darkLogoData?.logo_url ? `${darkLogoData.logo_url}?t=${timestamp}` : null;
      
      console.log('Logo data fetched with timestamps:', { 
        light: lightUrl, 
        dark: darkUrl,
        lightUpdated: lightLogoData?.updated_at,
        darkUpdated: darkLogoData?.updated_at
      });
      
      setLogoData({
        light: lightUrl,
        dark: darkUrl,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching logos:', error);
      setLogoData({
        light: null,
        dark: null,
        isLoading: false,
        error: error as Error
      });
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [refreshKey]); // Dependência no refreshKey para forçar atualizações

  // Método para forçar atualização das logos com efeito visual
  const refreshLogos = () => {
    console.log('Forcing logo refresh');
    toast.info('Atualizando logos...', { duration: 1500 });
    setRefreshKey(prev => prev + 1); // Incrementar a chave para forçar o re-fetch
  };

  return { ...logoData, refreshLogos };
};
