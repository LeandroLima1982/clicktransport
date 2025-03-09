
import React, { useState } from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

const DriverHeader: React.FC = () => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState(3);
  
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm transition-all duration-300 hover-card">
      <div className="flex items-center">
        <SidebarTrigger className="mr-2 md:mr-4" />
        <span className="text-lg md:text-xl font-semibold">Painel do Motorista</span>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <Button variant="ghost" size="icon" className="relative btn-hover-slide">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full pulse"></span>
          )}
        </Button>
        
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
            <DropdownMenuItem asChild>
              <Link to="/" className="w-full">Sair</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DriverHeader;
