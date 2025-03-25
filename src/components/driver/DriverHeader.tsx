
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DriverUserMenu from './header/DriverUserMenu';
import NotificationBell from './header/NotificationBell';
import HeaderTitle from './header/HeaderTitle';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DriverHeader: React.FC = () => {
  const { companyContext } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center mr-4">
          <img 
            src="/lovable-uploads/286d67a1-0db4-4257-82de-d5c01b35452e.png" 
            alt="LaTransfer Logo" 
            className="h-8 w-auto" 
          />
        </Link>
        <HeaderTitle title="Driver Dashboard" />
      </div>
      
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
