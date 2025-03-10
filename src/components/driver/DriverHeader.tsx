
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import HeaderTitle from './header/HeaderTitle';
import NotificationBell from './header/NotificationBell';
import DriverUserMenu from './header/DriverUserMenu';

const DriverHeader: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm transition-all duration-300 hover-card">
      <HeaderTitle title="Painel do Motorista" />
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <NotificationBell />
        <DriverUserMenu />
      </div>
    </header>
  );
};

export default DriverHeader;
