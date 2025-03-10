
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Loader2 } from 'lucide-react';
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
          <div className="flex flex-col space-y-2 pt-2">
            {user ? (
              <>
                {userRole === 'client' && (
                  <Link to="/bookings" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <User className="h-4 w-4 mr-2" />
                      Minhas Reservas
                    </Button>
                  </Link>
                )}
                {userRole === 'company' && (
                  <Link to="/company/dashboard" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <User className="h-4 w-4 mr-2" />
                      Painel da Empresa
                    </Button>
                  </Link>
                )}
                {userRole === 'driver' && (
                  <Link to="/driver/dashboard" onClick={onClose}>
                    <Button variant="outline" className="w-full text-left justify-start rounded-full">
                      <User className="h-4 w-4 mr-2" />
                      Painel do Motorista
                    </Button>
                  </Link>
                )}
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
