
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface NavbarLogoProps {
  logoUrl?: string;
}

const NavbarLogo: React.FC<NavbarLogoProps> = ({ logoUrl = '/lovable-uploads/318b76fe-b700-4667-b957-7da8cd9c254a.png' }) => {
  const { user, userRole } = useAuth();
  
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
      <motion.img
        src={logoUrl}
        alt="LaTransfer Logo"
        className="w-auto"
        initial={{ height: 48 }}
        animate={{ 
          height: document.documentElement.scrollTop > 10 ? 36 : 48 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
      />
    </Link>
  );
};

// Add displayName to the component to make it identifiable in NavbarContainer
NavbarLogo.displayName = 'NavbarLogo';

export default NavbarLogo;
