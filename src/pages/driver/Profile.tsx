
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const DriverProfile: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            
            <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold">Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
              </div>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="name">Nome Completo</label>
                      <Input 
                        id="name" 
                        defaultValue={user?.user_metadata?.firstName || ''} 
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="email">Email</label>
                      <Input 
                        id="email" 
                        defaultValue={user?.email || ''} 
                        disabled 
                      />
                    </div>
                    
                    <Button className="w-full sm:w-auto">
                      Salvar Alterações
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverProfile;
