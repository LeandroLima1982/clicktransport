
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Loader2, Settings, Car, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';

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
  if (!isOpen) return null;

  return (
    <div 
      className="md:hidden transition-all duration-300 ease-in-out overflow-hidden max-h-screen opacity-100"
    >
      <div className="container mx-auto px-4 py-4 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="flex flex-col space-y-3">
          <Link 
            to="/" 
            className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
            onClick={onClose}
          >
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
          
          {/* Role-specific menu items */}
          {user && (
            <div className="pt-2 pb-2 border-b border-gray-100">
              <p className="text-sm text-gray-500 py-1">
                {userRole === 'admin' && 'Conta Administrador'}
                {userRole === 'company' && 'Conta Empresa'}
                {userRole === 'driver' && 'Conta Motorista'}
                {userRole === 'client' && 'Conta Cliente'}
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2 pt-2">
            {user ? (
              <>
                {/* Admin panel */}
                {userRole === 'admin' && (
                  <Link to="/admin/dashboard" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <Users className="h-4 w-4 mr-2" />
                      Painel Admin
                    </Button>
                  </Link>
                )}
                
                {/* Company panel */}
                {userRole === 'company' && (
                  <Link to="/company/dashboard" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <Building className="h-4 w-4 mr-2" />
                      Painel da Empresa
                    </Button>
                  </Link>
                )}
                
                {/* Driver panel */}
                {userRole === 'driver' && (
                  <Link to="/driver/dashboard" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <Car className="h-4 w-4 mr-2" />
                      Painel do Motorista
                    </Button>
                  </Link>
                )}
                
                {/* Client bookings */}
                {userRole === 'client' && (
                  <Link to="/bookings" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <Car className="h-4 w-4 mr-2" />
                      Minhas Reservas
                    </Button>
                  </Link>
                )}
                
                {/* Profile link */}
                <Link to={`/${userRole}/profile`} onClick={onClose}>
                  <Button variant="outline" className="w-full text-left justify-start rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Button>
                </Link>
                
                {/* Settings link */}
                <Link to={`/${userRole}/settings`} onClick={onClose}>
                  <Button variant="outline" className="w-full text-left justify-start rounded-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </Link>
                
                {/* Logout button */}
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
                <Link to="/auth" onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full">
                    Entrar
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
