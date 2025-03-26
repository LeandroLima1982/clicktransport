
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, BookOpen, Building, CarFront, ChevronDown, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserMenuProps {
  user: any;
  userRole: string | null;
  handleSignOut: () => void;
  isAuthenticating: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  userRole,
  handleSignOut,
  isAuthenticating
}) => {
  const [open, setOpen] = useState(false);
  
  // Role-based menu items
  const getUserMenuItems = () => {
    if (userRole === 'client') {
      return [
        { label: 'Minhas Reservas', icon: BookOpen, link: '/bookings' },
        { label: 'Meu Perfil', icon: User, link: '/profile' },
        { label: 'Métodos de Pagamento', icon: Settings, link: '/payment-methods' },
      ];
    } else if (userRole === 'driver') {
      return [
        { label: 'Dashboard', icon: BarChart, link: '/driver/dashboard' },
        { label: 'Meus Transfers', icon: CarFront, link: '/driver/trips' },
        { label: 'Perfil', icon: User, link: '/driver/profile' },
      ];
    } else if (userRole === 'company') {
      return [
        { label: 'Dashboard', icon: BarChart, link: '/company/dashboard' },
        { label: 'Configurações', icon: Settings, link: '/company/settings' },
      ];
    } else if (userRole === 'admin') {
      return [
        { label: 'Dashboard Admin', icon: BarChart, link: '/admin' },
        { label: 'Destinos', icon: Building, link: '/admin/destinations' },
      ];
    } else if (userRole === 'investor') {
      return [
        { label: 'Dashboard Investidor', icon: BarChart, link: '/investor' },
      ];
    }
    
    return [];
  };
  
  const menuItems = getUserMenuItems();
  
  return (
    <div>
      {user ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:block font-medium text-sm">
                {user.email?.split('@')[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link to={item.link} className="cursor-pointer" onClick={() => setOpen(false)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={isAuthenticating}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/auth">
            <Button size="sm" className="rounded-md font-medium px-4 py-2 transition-all">
              Entrar
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default UserMenu;
