
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Car, Briefcase, Shield } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const LoginMenuItems = () => {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/auth?type=client" className="w-full">
          <User className="h-4 w-4 mr-2" />
          Login Cliente
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/auth?type=driver" className="w-full">
          <Car className="h-4 w-4 mr-2" />
          Login Motorista
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/auth?type=company" className="w-full">
          <Briefcase className="h-4 w-4 mr-2" />
          Login Empresa
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/auth?type=admin" className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Login Admin
        </Link>
      </DropdownMenuItem>
    </>
  );
};

export default LoginMenuItems;
