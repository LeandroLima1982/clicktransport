
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchLogos = async () => {
    try {
      setLogoData(prev => ({ ...prev, isLoading: true }));
      
      // Buscar logo para modo claro
      const { data: lightLogoData, error: lightError } = await supabase
        .from('site_logos')
        .select('logo_url')
        .eq('mode', 'light')
        .maybeSingle();
      
      // Buscar logo para modo escuro
      const { data: darkLogoData, error: darkError } = await supabase
        .from('site_logos')
        .select('logo_url')
        .eq('mode', 'dark')
        .maybeSingle();
      
      if (lightError && lightError.code !== 'PGRST116') throw lightError;
      if (darkError && darkError.code !== 'PGRST116') throw darkError;
      
      console.log('Logo data fetched:', { light: lightLogoData?.logo_url, dark: darkLogoData?.logo_url });
      
      setLogoData({
        light: lightLogoData?.logo_url || null,
        dark: darkLogoData?.logo_url || null,
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
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  // Método para forçar atualização das logos
  const refreshLogos = () => {
    fetchLogos();
  };

  return { ...logoData, refreshLogos };
};
