
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogos = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    try {
      setIsRefreshing(true);
      setLogoData(prev => ({ ...prev, isLoading: true }));
      
      // Fetch logos from database to ensure we're using the latest uploaded ones
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
      
      // Adiciona timestamp para evitar cache
      const timestamp = new Date().getTime();
      
      // Set the actual logo URLs from the database with cache-busting timestamps
      const lightLogoUrl = lightLogoData?.logo_url ? `${lightLogoData.logo_url}?t=${timestamp}` : '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
      const darkLogoUrl = darkLogoData?.logo_url ? `${darkLogoData.logo_url}?t=${timestamp}` : '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
      
      console.log('Logo data fetched:', { 
        dbLight: lightLogoData?.logo_url,
        dbDark: darkLogoData?.logo_url,
        lightWithTimestamp: lightLogoUrl,
        darkWithTimestamp: darkLogoUrl
      });
      
      // Update logo data with database values or defaults
      setLogoData({
        light: lightLogoUrl,
        dark: darkLogoUrl,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching logos:', error);
      setLogoData({
        light: '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png',
        dark: '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png',
        isLoading: false,
        error: error as Error
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Fetch logos once when component mounts
  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  // Método para atualização manual - usado APENAS pelo painel admin
  const refreshLogos = () => {
    if (isRefreshing) return; // Prevent multiple refreshes
    console.log('Admin panel: Forcing logo refresh');
    fetchLogos();
  };

  return { ...logoData, refreshLogos };
};
