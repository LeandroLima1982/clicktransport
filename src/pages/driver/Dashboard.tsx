
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import ServiceOrderList from '@/components/driver/ServiceOrderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, History, ChartBar } from 'lucide-react';
import DriverDashboard from '@/components/driver/DriverDashboard';
import TripHistory from '@/components/driver/TripHistory';
import { useAuth } from '@/hooks/useAuth';

const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            
            <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
              <div className="mb-6 md:mb-8 space-y-2 animate-fade-in">
                <h1 className="text-xl md:text-2xl font-bold">
                  Bem-vindo, {user?.user_metadata.firstName || 'Motorista'}
                </h1>
                <p className="text-muted-foreground">Gerencie sua agenda e atribuições de serviço</p>
              </div>
              
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-8">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <ChartBar className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Ordens de Serviço</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Histórico</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                  <DriverDashboard />
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-4">
                  <ServiceOrderList />
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <TripHistory />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverDashboardPage;
