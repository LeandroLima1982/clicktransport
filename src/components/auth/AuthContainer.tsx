
import React, { ReactNode, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import TransitionEffect from '@/components/TransitionEffect';
import { supabase } from '@/integrations/supabase/client';

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
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');

  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoSetting();
  }, []);

  return <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="LaTransfer Logo" 
              className="h-10 w-auto" 
            />
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
