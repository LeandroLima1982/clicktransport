
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

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setLogoData(prev => ({ ...prev, isLoading: true }));
      
      // Using the supabaseServices helper instead of direct query
      const { data: lightLogoData, error: lightError } = await supabase
        .from('site_logos')
        .select('logo_url')
        .eq('mode', 'light')
        .maybeSingle();
      
      const { data: darkLogoData, error: darkError } = await supabase
        .from('site_logos')
        .select('logo_url')
        .eq('mode', 'dark')
        .maybeSingle();
      
      if (lightError && lightError.code !== 'PGRST116') throw lightError;
      if (darkError && darkError.code !== 'PGRST116') throw darkError;
      
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

  // Add a method to refresh logos
  const refreshLogos = () => {
    fetchLogos();
  };

  return { ...logoData, refreshLogos };
};
