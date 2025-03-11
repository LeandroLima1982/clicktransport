
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const CompanyMenuItems = () => {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/company/dashboard" className="w-full">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Painel da Empresa
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/company/drivers" className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Gestão de Motoristas
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/company/settings" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Link>
      </DropdownMenuItem>
    </>
  );
};

export default CompanyMenuItems;
