
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DriverUserMenu from './header/DriverUserMenu';
import NotificationBell from './header/NotificationBell';
import HeaderTitle from './header/HeaderTitle';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const DriverHeader: React.FC = () => {
  const { companyContext } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/318b76fe-b700-4667-b957-7da8cd9c254a.png');

  useEffect(() => {
    const fetchLogoUrl = async () => {
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
          console.log('Driver header: Logo URL loaded from Supabase:', data.image_url);
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoUrl();

    // Subscribe to logo changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_images',
          filter: 'section_id=eq.logo'
        },
        (payload) => {
          console.log('Logo updated in database:', payload);
          if (payload.new && payload.new.image_url) {
            setLogoUrl(payload.new.image_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center mr-4">
          <motion.img 
            src={logoUrl} 
            alt="LaTransfer Logo" 
            className="h-8 w-auto" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          />
        </Link>
        <HeaderTitle title="Driver Dashboard" />
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        {companyContext && (
          <div className="hidden md:flex items-center text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-muted-foreground mr-1">Empresa:</span>
            <span className="font-medium">{companyContext.name}</span>
          </div>
        )}
        <NotificationBell />
        <DriverUserMenu />
      </div>
    </header>
  );
};

export default DriverHeader;
