
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
      
      // Set static logos for immediate display while fetching from database
      const staticLightLogo = '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
      const staticDarkLogo = '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
      
      // Update logo data with static logos first
      setLogoData({
        light: `${staticLightLogo}?t=${timestamp}`,
        dark: `${staticDarkLogo}?t=${timestamp}`,
        isLoading: false,
        error: null
      });
      
      // Still query database to maintain compatibility with the logo upload feature
      const { data: lightLogoData, error: lightError } = await supabase
        .from('site_logos')
        .select('logo_url, updated_at')
        .eq('mode', 'light')
        .maybeSingle();
      
      const { data: darkLogoData, error: darkError } = await supabase
        .from('site_logos')
        .select('logo_url, updated_at')
        .eq('mode', 'dark')
        .maybeSingle();
      
      if (lightError && lightError.code !== 'PGRST116') console.error(lightError);
      if (darkError && darkError.code !== 'PGRST116') console.error(darkError);
      
      console.log('Logo data fetched:', { 
        staticLight: staticLightLogo,
        staticDark: staticDarkLogo,
        dbLight: lightLogoData?.logo_url,
        dbDark: darkLogoData?.logo_url
      });
      
    } catch (error) {
      console.error('Error fetching logos:', error);
      setLogoData({
        light: '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png',
        dark: '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png',
        isLoading: false,
        error: error as Error
      });
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [refreshKey, fetchLogos]); // Dependência no refreshKey para forçar atualizações

  // Método para forçar atualização das logos com efeito visual
  const refreshLogos = () => {
    console.log('Forcing logo refresh');
    toast.info('Atualizando logos...', { duration: 1500 });
    setRefreshKey(prev => prev + 1); // Incrementar a chave para forçar o re-fetch
  };

  // Força atualização inicial quando o hook é montado
  useEffect(() => {
    const initialRefresh = setTimeout(() => {
      refreshLogos();
    }, 500); // Atraso pequeno para garantir que componentes estejam montados
    
    return () => clearTimeout(initialRefresh);
  }, []);

  return { ...logoData, refreshLogos };
};
