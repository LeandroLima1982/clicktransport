
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const NavbarLogo: React.FC = () => {
  const { user, userRole } = useAuth();
  
  // Get logo URL from environment or use default
  const logoUrl = '/lovable-uploads/4426e89f-4ae5-492a-84b3-eb7935af6e46.png';
  
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

export default NavbarLogo;
