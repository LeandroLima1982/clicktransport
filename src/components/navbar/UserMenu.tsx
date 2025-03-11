
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AdminMenuItems,
  ClientMenuItems,
  CompanyMenuItems,
  DriverMenuItems,
  LoginMenuItems,
  UserMenuButton
} from './menu-items';

interface UserMenuProps {
  user: any;
  userRole: UserRole;
  handleSignOut: () => Promise<void>;
  isAuthenticating: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  user, 
  userRole, 
  handleSignOut,
  isAuthenticating
}) => {
  if (!user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full px-6 btn-hover-slide">
              Entrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <LoginMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/auth?register=true">
          <Button className="rounded-full px-6 btn-hover-slide">Cadastrar</Button>
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserMenuButton email={user.email} userRole={userRole} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Olá, {user.email?.split('@')[0]}
          {userRole && (
            <span className="block text-xs text-muted-foreground mt-1">
              Tipo de conta: {userRole === 'client' ? 'Cliente' : 
                             userRole === 'company' ? 'Empresa' : 
                             userRole === 'driver' ? 'Motorista' : 
                             userRole === 'admin' ? 'Admin' : 'Usuário'}
            </span>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link to="/" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Página Inicial
          </Link>
        </DropdownMenuItem>
        
        {userRole === 'client' && <ClientMenuItems />}
        {userRole === 'company' && <CompanyMenuItems />}
        {userRole === 'driver' && <DriverMenuItems />}
        {userRole === 'admin' && <AdminMenuItems />}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} disabled={isAuthenticating}>
          {isAuthenticating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
