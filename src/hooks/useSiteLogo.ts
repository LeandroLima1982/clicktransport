
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
      
      const { data, error } = await supabase
        .from('site_logos')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        const lightLogo = data.find(logo => logo.mode === 'light')?.logo_url || null;
        const darkLogo = data.find(logo => logo.mode === 'dark')?.logo_url || null;
        
        setLogoData({
          light: lightLogo,
          dark: darkLogo,
          isLoading: false,
          error: null
        });
      }
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

  return logoData;
};
