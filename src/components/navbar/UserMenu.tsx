
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Loader2, Car, Briefcase, Shield, LayoutDashboard, Book, Home, Settings, Users, Calendar, CreditCard, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

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
    return <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full px-6 btn-hover-slide">
              Entrar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/auth?register=true">
          <Button className="rounded-full px-6 btn-hover-slide mx-[8px]">Cadastrar-se</Button>
        </Link>
      </>;
  }
  
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full px-4 btn-hover-slide flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
          {userRole && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {userRole === 'client' && 'Cliente'}
              {userRole === 'company' && 'Empresa'}
              {userRole === 'driver' && 'Motorista'}
              {userRole === 'admin' && 'Admin'}
            </span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Olá, {user.email?.split('@')[0]}
          {userRole && <span className="block text-xs text-muted-foreground mt-1">
              Tipo de conta: {userRole === 'client' ? 'Cliente' : userRole === 'company' ? 'Empresa' : userRole === 'driver' ? 'Motorista' : userRole === 'admin' ? 'Admin' : 'Usuário'}
            </span>}
        </DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link to="/" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Página Inicial
          </Link>
        </DropdownMenuItem>
        
        {userRole === 'client' && <>
            <DropdownMenuItem asChild>
              <Link to="/bookings" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Minhas Reservas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/payment-methods" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Métodos de Pagamento
              </Link>
            </DropdownMenuItem>
          </>}
        
        {userRole === 'company' && <>
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
          </>}
        
        {userRole === 'driver' && <>
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
          </>}
        
        {userRole === 'admin' && <>
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
            <DropdownMenuItem asChild>
              <Link to="/admin/test-workflow" className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Ambiente de Testes
              </Link>
            </DropdownMenuItem>
          </>}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} disabled={isAuthenticating}>
          {isAuthenticating ? <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saindo...
            </> : <>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};

export default UserMenu;
