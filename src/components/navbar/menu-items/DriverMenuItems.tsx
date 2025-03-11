
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, User, Car } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const DriverMenuItems = () => {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/driver/dashboard" className="w-full">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Painel do Motorista
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/driver/profile" className="w-full">
          <User className="h-4 w-4 mr-2" />
          Meu Perfil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/driver/trips" className="w-full">
          <Car className="h-4 w-4 mr-2" />
          Minhas Viagens
        </Link>
      </DropdownMenuItem>
    </>
  );
};

export default DriverMenuItems;
