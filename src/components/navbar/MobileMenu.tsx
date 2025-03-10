
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
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: UserRole;
  handleSignOut: () => Promise<void>;
  isAuthenticating: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  userRole,
  handleSignOut,
  isAuthenticating
}) => {
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;

  // If on mobile, use bottom tab bar style nav
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-up">
        {user ? (
          // Logged in experience - Role-specific tab bar
          <div className="tab-bar">
            {userRole === 'client' && (
              <>
                <Link to="/" className="tab-item" onClick={onClose}>
                  <Home className="h-5 w-5 mb-1" />
                  <span className="text-xs">Início</span>
                </Link>
                <Link to="/bookings" className="tab-item" onClick={onClose}>
                  <Book className="h-5 w-5 mb-1" />
                  <span className="text-xs">Reservas</span>
                </Link>
                <Link to="/#request-service" className="tab-item" onClick={onClose}>
                  <Car className="h-5 w-5 mb-1" />
                  <span className="text-xs">Solicitar</span>
                </Link>
                <Link to="/profile" className="tab-item" onClick={onClose}>
                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">Perfil</span>
                </Link>
              </>
            )}
            
            {userRole === 'driver' && (
              <>
                <Link to="/driver/dashboard" className="tab-item" onClick={onClose}>
                  <LayoutDashboard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Dashboard</span>
                </Link>
                <Link to="/driver/trips" className="tab-item" onClick={onClose}>
                  <Car className="h-5 w-5 mb-1" />
                  <span className="text-xs">Viagens</span>
                </Link>
                <Link to="/driver/navigation" className="tab-item" onClick={onClose}>
                  <MapPin className="h-5 w-5 mb-1" />
                  <span className="text-xs">Mapa</span>
                </Link>
                <Link to="/driver/profile" className="tab-item" onClick={onClose}>
                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">Perfil</span>
                </Link>
              </>
            )}
            
            {userRole === 'company' && (
              <>
                <Link to="/company/dashboard" className="tab-item" onClick={onClose}>
                  <LayoutDashboard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Dashboard</span>
                </Link>
                <Link to="/company/drivers" className="tab-item" onClick={onClose}>
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-xs">Motoristas</span>
                </Link>
                <Link to="/company/calendar" className="tab-item" onClick={onClose}>
                  <Calendar className="h-5 w-5 mb-1" />
                  <span className="text-xs">Agenda</span>
                </Link>
                <Link to="/company/settings" className="tab-item" onClick={onClose}>
                  <Settings className="h-5 w-5 mb-1" />
                  <span className="text-xs">Config</span>
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="tab-item" onClick={onClose}>
                  <LayoutDashboard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Dashboard</span>
                </Link>
                <Link to="/admin/database-setup" className="tab-item" onClick={onClose}>
                  <Settings className="h-5 w-5 mb-1" />
                  <span className="text-xs">Database</span>
                </Link>
              </>
            )}
          </div>
        ) : (
          // Non-logged in experience
          <div className="tab-bar">
            <Link to="/" className="tab-item" onClick={onClose}>
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Início</span>
            </Link>
            <a href="#request-service" className="tab-item" onClick={onClose}>
              <Car className="h-5 w-5 mb-1" />
              <span className="text-xs">Solicitar</span>
            </a>
            <Link to="/auth?type=client" className="tab-item" onClick={onClose}>
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Login</span>
            </Link>
            <Link to="/auth?register=true" className="tab-item" onClick={onClose}>
              <LogOut className="h-5 w-5 mb-1" />
              <span className="text-xs">Cadastro</span>
            </Link>
          </div>
        )}
        
        {/* Add a swipe indicator for the drawer */}
        <div className="swipe-indicator" onClick={onClose}></div>
      </div>
    );
  }

  // For larger screens, use the existing vertical menu
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

export default MobileMenu;
