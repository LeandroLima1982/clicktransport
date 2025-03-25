
import React from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Plane } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  const { light: lightLogo } = useSiteLogo();
  
  return (
    <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      {lightLogo ? (
        <img 
          src={lightLogo} 
          alt="LaTransfer" 
          className={`${isMobile ? 'h-7' : 'h-8'} w-auto`}
          onError={(e) => {
            console.error('Error loading logo in NavbarLogo:', e);
            // In case of error, fall back to default
            e.currentTarget.src = '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
          }}
        />
      ) : (
        <>
          <div className="relative">
            <CarFront className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-secondary`} />
            <Plane className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary absolute -top-2 -right-2 transform rotate-45`} />
          </div>
          <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>
            La<span className="text-primary">Transfer</span>
          </span>
        </>
      )}
    </Link>
  );
};

export default NavbarLogo;
