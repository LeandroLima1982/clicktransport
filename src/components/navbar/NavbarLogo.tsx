
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <img 
        src="/lovable-uploads/286d67a1-0db4-4257-82de-d5c01b35452e.png" 
        alt="LaTransfer Logo" 
        className={`${isMobile ? 'h-8' : 'h-10'} w-auto`} 
      />
    </Link>
  );
};

export default NavbarLogo;
