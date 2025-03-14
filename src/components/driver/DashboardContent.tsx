
import React from 'react';
import StatsCards from './StatsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import DriverDashboard from './DriverDashboard';
import ServiceOrderList from './ServiceOrderList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, FileText, History, MapPin, Clock } from 'lucide-react';
import TripHistory from './TripHistory';
import { useAuth } from '@/hooks/useAuth';

const DashboardContent: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="mb-6 md:mb-8 space-y-2 animate-fade-in">
        <h1 className="text-xl md:text-2xl font-bold">
          Bem-vindo, {user?.user_metadata.firstName || 'Motorista'}
        </h1>
        <p className="text-muted-foreground">Gerencie sua agenda e atribuições de serviço</p>
      </div>
      
      <div className="space-y-6">
        <div className="animate-slide-in" style={{animationDelay: '0.1s'}}>
          <StatsCards />
        </div>
        
        <div className="animate-slide-in" style={{animationDelay: '0.2s'}}>
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
        </div>
      </div>
    </main>
  );
};

export default DashboardContent;
