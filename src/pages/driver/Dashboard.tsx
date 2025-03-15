
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import ServiceOrderList from '@/components/driver/ServiceOrderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, History, ChartBar, MapPin, Clock } from 'lucide-react';
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
        <div className="flex flex-col min-h-screen bg-[#1F1F1F]">
          <div className="app-header">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Olá, {user?.user_metadata.firstName || 'Motorista'}
                  </h1>
                  <p className="text-xs text-white/70">Dashboard do Motorista</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#F8D748] flex items-center justify-center text-[#1F1F1F]">
                      {user?.user_metadata.firstName?.[0] || 'M'}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1F1F1F]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* App-like timer display */}
          <div className="bg-[#262626] px-4 py-6 mb-4">
            <div className="timer-display">32:21</div>
            <div className="timer-label">Tempo de Espera</div>
            
            <div className="flex justify-center gap-3 mt-4">
              <button className="action-btn py-2 px-4 flex-1">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Ver Mapa</span>
              </button>
              <button className="action-btn-secondary py-2 px-4 flex-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>Status</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 pt-0 pb-20 overflow-auto px-4">
            <Tabs defaultValue="dashboard" className="w-full animate-fade-in">
              <TabsList className="w-full grid grid-cols-3 mb-6 bg-[#262626] p-1 rounded-xl">
                <TabsTrigger value="dashboard" className="rounded-lg text-white data-[state=active]:bg-[#333333] data-[state=active]:text-[#F8D748]">
                  <ChartBar className="h-4 w-4 mr-2" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="rounded-lg text-white data-[state=active]:bg-[#333333] data-[state=active]:text-[#F8D748]">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Serviços</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg text-white data-[state=active]:bg-[#333333] data-[state=active]:text-[#F8D748]">
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
