import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import ServiceOrderList from '@/components/driver/ServiceOrderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, History, ChartBar, MapPin } from 'lucide-react';
import DriverDashboard from '@/components/driver/DriverDashboard';
import TripHistory from '@/components/driver/TripHistory';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <TransitionEffect>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <div className="app-header bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold">
                    Olá, {user?.user_metadata.firstName || 'Motorista'}
                  </h1>
                  <p className="text-xs text-primary-foreground/70">Dashboard do Motorista</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      {user?.user_metadata.firstName?.[0] || 'M'}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-primary"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 pt-4 pb-20 overflow-auto">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="dashboard" className="w-full animate-fade-in">
                <TabsList className="w-full grid grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white">
                    <ChartBar className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-white">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Serviços</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white">
                    <History className="h-4 w-4 mr-2" />
                    <span>Histórico</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4 animate-fade-in">
                  <DriverDashboard />
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-4 animate-fade-in">
                  <ServiceOrderList />
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4 animate-fade-in">
                  <TripHistory />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="h-16">
            {/* Spacer for the fixed position bottom nav */}
          </div>
        </div>
      </TransitionEffect>
    );
  }
  
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
