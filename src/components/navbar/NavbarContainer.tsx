
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface NavbarContainerProps {
  children: React.ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  const { user } = useAuth();
  
  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' 
          : 'bg-white/80 backdrop-blur-sm py-4'
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {children}
        
        {user && (
          <div className="hidden md:flex items-center text-sm ml-4">
            <span className="text-muted-foreground mr-1">Olá,</span>
            <span className="font-medium">{user.email?.split('@')[0]}</span>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default NavbarContainer;
