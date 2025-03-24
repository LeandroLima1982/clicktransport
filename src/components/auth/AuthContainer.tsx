
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TransitionEffect from '@/components/TransitionEffect';

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
  return <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Car className="h-6 w-6 text-primary" />
              <Plane className="h-5 w-5 text-secondary absolute -top-1 -right-1 transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              La<span className="text-primary">Transfer</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <div className="space-y-1 text-center p-6">
              {icon && <div className="flex justify-center">{icon}</div>}
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            
            {error && <div className="mx-6 mb-4 px-4 py-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>}
            
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
    </TransitionEffect>;
};

export default AuthContainer;
