
import React, { useState, useEffect } from 'react';
import { User, LogOut, Loader2, Car, Settings, LayoutDashboard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DriverUserMenu: React.FC = () => {
  const { signOut, isAuthenticating, user, companyContext } = useAuth();
  const navigate = useNavigate();
  const [driverData, setDriverData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadDriverData();
    }
  }, [user]);
  
  const loadDriverData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch driver data including company_id
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*, company:company_id(name)')
        .eq('user_id', user.id)
        .single();
      
      if (driverError) {
        console.error('Error fetching driver data:', driverError);
        return;
      }
      
      setDriverData(driverData);
    } catch (error) {
      console.error('Error in loadDriverData:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      setLocalLoading(true);
      console.log('Driver logging out...');
      
      // First try direct logout
      try {
        await supabase.auth.signOut();
        console.log('Driver direct logout successful');
        
        // Clear any driver-specific data
        localStorage.removeItem('driverCompanyId');
        localStorage.removeItem('driverCompanyName');
        
        toast.success('Logout realizado com sucesso');
        navigate('/', { replace: true });
        return;
      } catch (directError) {
        console.error('Direct logout failed, trying fallback:', directError);
      }
      
      // Fallback to using the Auth context
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLocalLoading(false);
    }
  };

  const companyName = companyContext?.name || driverData?.company?.name;
  const isSigningOut = isAuthenticating || localLoading;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="btn-hover-slide">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {companyName && (
          <>
            <DropdownMenuLabel className="flex items-center text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Empresa: {companyName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link to="/" className="w-full">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Página Inicial
          </Link>
        </DropdownMenuItem>
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
        <DropdownMenuItem asChild>
          <Link to="/driver/settings" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? (
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
