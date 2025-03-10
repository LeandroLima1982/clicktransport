
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
        {userRole === 'client' && (
          <DropdownMenuItem asChild>
            <Link to="/bookings" className="w-full">Minhas Reservas</Link>
          </DropdownMenuItem>
        )}
        {userRole === 'company' && (
          <DropdownMenuItem asChild>
            <Link to="/company/dashboard" className="w-full">Painel da Empresa</Link>
          </DropdownMenuItem>
        )}
        {userRole === 'driver' && (
          <DropdownMenuItem asChild>
            <Link to="/driver/dashboard" className="w-full">Painel do Motorista</Link>
          </DropdownMenuItem>
        )}
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
