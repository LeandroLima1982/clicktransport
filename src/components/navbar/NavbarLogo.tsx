
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface NavbarLogoProps {
  logoUrl?: string;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ logoUrl }) => {
  const { user, userRole } = useAuth();
  const { scrollY } = useScroll();
  const [currentLogo, setCurrentLogo] = useState<string | undefined>(logoUrl);
  
  // Create a motion value that transforms based on scroll position
  const logoHeight = useTransform(scrollY, [0, 100], [60, 45]);
  
  // Fetch the logo URL from Supabase directly to ensure it's always up-to-date
  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo:', error);
          return;
        }
        
        if (data && data.image_url) {
          console.log('NavbarLogo - Logo URL loaded:', data.image_url);
          setCurrentLogo(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };

    fetchLogoUrl();

    // Subscribe to changes in the site_images table
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
            setCurrentLogo(payload.new.image_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Define the appropriate homepage route based on user role
  const getHomeRoute = () => {
    if (!user) return '/';
    
    switch(userRole) {
      case 'admin': return '/admin';
      case 'company': return '/company/dashboard';
      case 'driver': return '/driver/dashboard';
      case 'investor': return '/investor';
      case 'client': return '/bookings';
      default: return '/';
    }
  };

  return (
    <Link 
      to={getHomeRoute()} 
      className="flex items-center focus:outline-none"
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden"
      >
        <motion.img
          src={currentLogo || '/lovable-uploads/318b76fe-b700-4667-b957-7da8cd9c254a.png'}
          alt="LaTransfer Logo"
          className="w-auto object-contain"
          style={{ height: logoHeight }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
          whileHover={{ scale: 1.05 }}
        />
      </motion.div>
    </Link>
  );
};

// Add displayName to the component to make it identifiable in NavbarContainer
NavbarLogo.displayName = 'NavbarLogo';

export default NavbarLogo;
