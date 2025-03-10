
import React from 'react';
import { User, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

const DriverUserMenu: React.FC = () => {
  const { signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      console.log('Driver logging out...');
      await signOut();
      // Navigate immediately after calling signOut, don't wait for the promise to resolve
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Error will be displayed by the AuthProvider
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="btn-hover-slide">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/driver/profile" className="w-full">Meu Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/driver/settings" className="w-full">Configurações</Link>
        </DropdownMenuItem>
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

export default DriverUserMenu;
