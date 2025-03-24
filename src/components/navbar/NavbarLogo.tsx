
import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Car } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  return <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <div className="relative">
        <Car className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-secondary`} />
        <Plane className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary absolute -top-1 -right-1 transform rotate-45`} />
      </div>
      <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>
        La<span className="text-primary">Transfer</span>
      </span>
    </Link>;
};

export default NavbarLogo;
