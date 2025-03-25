
import React, { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TransitionEffect from '@/components/TransitionEffect';
import { useSiteLogo } from '@/hooks/useSiteLogo';

interface AuthContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  description: string;
  error: string | null;
  children: ReactNode;
  icon?: ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  activeTab,
  setActiveTab,
  title,
  description,
  error,
  children,
  icon
}) => {
  const { light: lightLogo, refreshLogos } = useSiteLogo();
  
  useEffect(() => {
    console.log('AuthContainer: Refreshing logos');
    refreshLogos();
  }, []);
  
  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            {lightLogo ? (
              <img 
                src={lightLogo} 
                alt="LaTransfer" 
                className="h-8 w-auto"
                key={lightLogo} // Forçar re-renderização quando URL mudar
              />
            ) : (
              <>
                <div className="relative">
                  <CarFront className="h-6 w-6 text-secondary" />
                  <Plane className="h-5 w-5 text-primary absolute -top-2 -right-2 transform rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  La<span className="text-primary">Transfer</span>
                </span>
              </>
            )}
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <div className="space-y-1 text-center p-6">
              {icon && <div className="flex justify-center">{icon}</div>}
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            
            {error && (
              <div className="mx-6 mb-4 px-4 py-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {children}
            </Tabs>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default AuthContainer;
