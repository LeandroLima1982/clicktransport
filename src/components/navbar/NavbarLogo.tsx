
import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

const NavbarLogo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 animate-fade-in">
      <Car className="h-5 w-5 md:h-6 md:w-6 text-primary" />
      <span className="text-lg md:text-xl font-bold tracking-tight">
        Link<span className="text-primary">Transfer</span>
      </span>
    </Link>
  );
};

export default NavbarLogo;
