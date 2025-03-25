
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  const { light: lightLogo } = useSiteLogo();
  
  return (
    <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <img 
        src={lightLogo || '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png'} 
        alt="LaTransfer" 
        className={`${isMobile ? 'h-7' : 'h-8'} w-auto`}
        onError={(e) => {
          console.error('Error loading logo in NavbarLogo:', e);
          e.currentTarget.src = '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png';
        }}
      />
    </Link>
  );
};

export default NavbarLogo;
