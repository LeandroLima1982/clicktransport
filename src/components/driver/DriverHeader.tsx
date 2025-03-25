
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DriverUserMenu from './header/DriverUserMenu';
import NotificationBell from './header/NotificationBell';
import HeaderTitle from './header/HeaderTitle';
import { Building2, CarFront, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const DriverHeader: React.FC = () => {
  const { companyContext } = useAuth();
  const { light: lightLogo, refreshLogos } = useSiteLogo();
  
  // Refresh logos once when component mounts
  useEffect(() => {
    console.log('DriverHeader: Refreshing logos');
    refreshLogos();
    // No dependence on refreshLogos to avoid loops
  }, []);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2 mr-4">
          {lightLogo ? (
            <img 
              src={lightLogo} 
              alt="LaTransfer" 
              className="h-6 w-auto"
              key={`driver-header-${lightLogo}`} // Force re-render with specific key
              onError={(e) => {
                console.error('Error loading logo in DriverHeader:', e);
                // In case of error, fall back to default
                e.currentTarget.src = '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
              }}
            />
          ) : (
            <div className="relative">
              <CarFront className="h-5 w-5 text-secondary" />
              <Plane className="h-4 w-4 text-primary absolute -top-2 -right-2 transform rotate-45" />
            </div>
          )}
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
