import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
const NavbarLogo: React.FC = () => {
  const isMobile = useIsMobile();
  return <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <Car className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
      <span className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>
        Click<span className="text-primary">iTran</span>
      </span>
    </Link>;
};
export default NavbarLogo;