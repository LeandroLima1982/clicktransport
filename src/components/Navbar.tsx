
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import {
  NavbarContainer,
  NavbarLogo,
  NavbarLinks,
  UserMenu,
  MobileMenu
} from './navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();

  // When component mounts, check if realtime is enabled and set up if not
  useEffect(() => {
    const checkAndEnableRealtime = async () => {
      try {
        // Check if site_images table already has REPLICA IDENTITY FULL
        const { data: replicaCheckData, error: replicaCheckError } = await supabase.rpc('exec_sql' as any, {
          query: "SELECT obj_description(oid, 'pg_class') FROM pg_class WHERE relname = 'site_images';"
        });
        
        // Fix: Check if replicaCheckData is an array or string and use appropriate method
        const replicaDataStr = typeof replicaCheckData === 'string' ? replicaCheckData : 
                              (Array.isArray(replicaCheckData) ? JSON.stringify(replicaCheckData) : '');
        
        // If not set, enable it
        if (!replicaCheckError && (!replicaDataStr || !replicaDataStr.includes('REPLICA IDENTITY FULL'))) {
          await supabase.rpc('exec_sql' as any, {
            query: 'ALTER TABLE public.site_images REPLICA IDENTITY FULL;'
          });
        }
        
        // Check if site_images is in supabase_realtime publication
        const { data: publicationCheckData, error: publicationCheckError } = await supabase.rpc('exec_sql' as any, {
          query: "SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_images';"
        });
        
        // Fix: Check if publicationCheckData is an array before using length
        const hasPublicationData = Array.isArray(publicationCheckData) && publicationCheckData.length > 0;
        
        // If not in publication, add it
        if (!publicationCheckError && !hasPublicationData) {
          await supabase.rpc('exec_sql' as any, {
            query: 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_images;'
          });
        }
      } catch (error) {
        console.error('Error checking/enabling realtime:', error);
      }
    };
    
    // Only try to enable realtime if user is admin (requires special privileges)
    if (userRole === 'admin') {
      checkAndEnableRealtime();
    }
  }, [userRole]);

  const handleSignOut = async () => {
    try {
      console.log('Navbar logging out...');
      await signOut();
      navigate('/', { replace: true });
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Add padding to body to account for fixed navbar
  useEffect(() => {
    const body = document.body;
    body.style.paddingTop = scrolled ? '64px' : '80px';
    
    return () => {
      body.style.paddingTop = '0';
    };
  }, [scrolled]);

  return (
    <>
      <NavbarContainer scrolled={scrolled}>
        <motion.div
          className="flex items-center justify-between w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 100
          }}
        >
          <NavbarLogo />
          
          <div className="hidden md:flex items-center space-x-6">
            <NavbarLinks />
            <UserMenu 
              user={user} 
              userRole={userRole} 
              handleSignOut={handleSignOut} 
              isAuthenticating={isAuthenticating} 
            />
          </div>

          {/* Mobile menu button */}
          <motion.button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-100/80 text-gray-700 focus:outline-none"
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mobileMenuOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </NavbarContainer>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        userRole={userRole}
        handleSignOut={handleSignOut}
        isAuthenticating={isAuthenticating}
      />
    </>
  );
};

export default Navbar;
