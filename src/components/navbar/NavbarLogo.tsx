
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, useScroll, useTransform } from 'framer-motion';

interface NavbarLogoProps {
  logoUrl?: string;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ logoUrl = '/lovable-uploads/318b76fe-b700-4667-b957-7da8cd9c254a.png' }) => {
  const { user, userRole } = useAuth();
  const { scrollY } = useScroll();
  
  // Create a motion value that transforms based on scroll position
  const logoHeight = useTransform(scrollY, [0, 100], [60, 45]);
  
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
          src={logoUrl}
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
