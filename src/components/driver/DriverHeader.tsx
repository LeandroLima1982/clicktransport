
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DriverUserMenu from './header/DriverUserMenu';
import NotificationBell from './header/NotificationBell';
import HeaderTitle from './header/HeaderTitle';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const DriverHeader: React.FC = () => {
  const { companyContext } = useAuth();
  const { light: lightLogo } = useSiteLogo();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 mr-4">
          <img 
            src={lightLogo || '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png'} 
            alt="LaTransfer" 
            className="h-6 w-auto"
            onError={(e) => {
              console.error('Error loading logo in DriverHeader:', e);
              e.currentTarget.src = '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png';
            }}
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
