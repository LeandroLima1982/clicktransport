
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Settings } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const AdminMenuItems = () => {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/admin/dashboard" className="w-full">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Painel Admin
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/admin/database-setup" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Configuração do Banco
        </Link>
      </DropdownMenuItem>
    </>
  );
};

export default AdminMenuItems;
