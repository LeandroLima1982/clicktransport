
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Loader2, 
  Car, 
  Briefcase, 
  Shield, 
  LayoutDashboard,
  Book,
  Home,
  Settings,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import { Separator } from '@/components/ui/separator';

interface MobileVerticalMenuProps {
  user: any;
  userRole: UserRole;
  handleSignOut: () => Promise<void>;
  isAuthenticating: boolean;
  onClose: () => void;
}

const MobileVerticalMenu: React.FC<MobileVerticalMenuProps> = ({
  user,
  userRole,
  handleSignOut,
  isAuthenticating,
  onClose
}) => {
  return (
    <div className="md:hidden transition-all duration-300 ease-in-out overflow-hidden max-h-screen opacity-100">
      <div className="container mx-auto px-4 py-4 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="flex flex-col space-y-3">
          <Link 
            to="/" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100 flex items-center"
            onClick={onClose}
          >
            <Home className="h-4 w-4 mr-2" />
            Início
          </Link>
          <a 
            href="#request-service" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
            onClick={onClose}
          >
            Solicitar Serviço
          </a>
          <Link 
            to="/about" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
            onClick={onClose}
          >
            Sobre
          </Link>
          <Link 
            to="/contact" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
            onClick={onClose}
          >
            Contato
          </Link>

          <div className="flex flex-col space-y-2 pt-2">
            {user ? (
              <>
                <p className="text-sm font-medium text-muted-foreground py-1">Conta: {user.email?.split('@')[0]}</p>
                
                {/* Role-specific navigation options */}
                {userRole === 'client' && (
                  <>
                    <Link to="/bookings" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <Book className="h-4 w-4 mr-2" />
                        Minhas Reservas
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Button>
                    </Link>
                  </>
                )}
                
                {userRole === 'company' && (
                  <>
                    <Link to="/company/dashboard" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Painel da Empresa
                      </Button>
                    </Link>
                    <Link to="/company/drivers" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <Users className="h-4 w-4 mr-2" />
                        Gestão de Motoristas
                      </Button>
                    </Link>
                    <Link to="/company/settings" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    </Link>
                  </>
                )}
                
                {userRole === 'driver' && (
                  <>
                    <Link to="/driver/dashboard" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Painel do Motorista
                      </Button>
                    </Link>
                    <Link to="/driver/profile" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <User className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </Button>
                    </Link>
                    <Link to="/driver/trips" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <Car className="h-4 w-4 mr-2" />
                        Minhas Viagens
                      </Button>
                    </Link>
                  </>
                )}
                
                {userRole === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Painel Admin
                      </Button>
                    </Link>
                    <Link to="/admin/database-setup" onClick={onClose}>
                      <Button variant="outline" className="w-full text-left justify-start rounded-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuração do Banco
                      </Button>
                    </Link>
                  </>
                )}
                
                <Separator className="my-2" />
                
                <Button 
                  onClick={() => {
                    handleSignOut();
                    onClose();
                  }}
                  className="w-full rounded-full"
                  disabled={isAuthenticating}
                >
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
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground py-1">Selecione o tipo de login:</p>
                <Link to="/auth?type=client" onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full flex items-center justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Login Cliente
                  </Button>
                </Link>
                <Link to="/auth?type=driver" onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full flex items-center justify-start">
                    <Car className="h-4 w-4 mr-2" />
                    Login Motorista
                  </Button>
                </Link>
                <Link to="/auth?type=company" onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full flex items-center justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Login Empresa
                  </Button>
                </Link>
                <Link to="/auth?type=admin" onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full flex items-center justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Login Admin
                  </Button>
                </Link>
                <Link to="/auth?register=true" onClick={onClose}>
                  <Button className="w-full rounded-full">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileVerticalMenu;
