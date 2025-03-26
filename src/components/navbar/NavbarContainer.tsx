
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NavbarContainerProps {
  children: React.ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');
  
  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' 
        : 'bg-white/80 backdrop-blur-sm py-4'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {React.Children.map(children, child => {
          // Pass logoUrl to child components
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { logoUrl });
          }
          return child;
        })}
        
        {user && (
          <div className="hidden md:flex items-center text-sm ml-4">
            <span className="text-muted-foreground mr-1">Olá,</span>
            <span className="font-medium">{user.email?.split('@')[0]}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavbarContainer;
