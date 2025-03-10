
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Loader2, Settings, Car, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
        <Link to="/auth">
          <Button variant="outline" className="rounded-full px-6 btn-hover-slide">
            Entrar
          </Button>
        </Link>
        <Link to="/auth?register=true">
          <Button className="rounded-full px-6 btn-hover-slide">Cadastrar</Button>
        </Link>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full px-4 btn-hover-slide flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-medium text-gray-500 cursor-default">
          {userRole === 'admin' && 'Administrador'}
          {userRole === 'company' && 'Empresa'}
          {userRole === 'driver' && 'Motorista'}
          {userRole === 'client' && 'Cliente'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Admin panel */}
        {userRole === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin/dashboard" className="w-full flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Painel Admin
            </Link>
          </DropdownMenuItem>
        )}
        
        {/* Company panel */}
        {userRole === 'company' && (
          <DropdownMenuItem asChild>
            <Link to="/company/dashboard" className="w-full flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Painel da Empresa
            </Link>
          </DropdownMenuItem>
        )}
        
        {/* Driver panel */}
        {userRole === 'driver' && (
          <DropdownMenuItem asChild>
            <Link to="/driver/dashboard" className="w-full flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Painel do Motorista
            </Link>
          </DropdownMenuItem>
        )}
        
        {/* Client bookings */}
        {userRole === 'client' && (
          <DropdownMenuItem asChild>
            <Link to="/bookings" className="w-full flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Minhas Reservas
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Profile link - available for all roles */}
        <DropdownMenuItem asChild>
          <Link to={`/${userRole}/profile`} className="w-full flex items-center">
            <User className="h-4 w-4 mr-2" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        
        {/* Settings link - available for all roles */}
        <DropdownMenuItem asChild>
          <Link to={`/${userRole}/settings`} className="w-full flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout button */}
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
