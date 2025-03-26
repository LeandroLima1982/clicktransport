import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');
  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_images').select('image_url').eq('section_id', 'logo').single();
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };
    fetchLogoSetting();
  }, []);
  return <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <img src={logoUrl} alt="LaTransfer Logo" className="object-scale-down" />
    </Link>;
};
export default NavbarLogo;