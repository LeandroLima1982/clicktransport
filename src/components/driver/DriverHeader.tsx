
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DriverUserMenu from './header/DriverUserMenu';
import NotificationBell from './header/NotificationBell';
import HeaderTitle from './header/HeaderTitle';
import { Building2 } from 'lucide-react';

const DriverHeader: React.FC = () => {
  const { companyContext } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <HeaderTitle />
      
      <div className="ml-auto flex items-center gap-4">
        {companyContext && (
          <div className="hidden md:flex items-center text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-muted-foreground mr-1">Empresa:</span>
            <span className="font-medium">{companyContext.name}</span>
          </div>
        )}
        <NotificationBell />
        <DriverUserMenu />
      </div>
    </header>
  );
};

export default DriverHeader;
