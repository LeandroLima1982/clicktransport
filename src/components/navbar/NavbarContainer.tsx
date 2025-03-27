
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface NavbarContainerProps {
  children: React.ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  const { user } = useAuth();
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' 
        : 'bg-white/80 backdrop-blur-sm py-3 md:py-4'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {children}
        
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
