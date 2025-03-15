
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import TripHistory from '@/components/driver/TripHistory';

const DriverTrips: React.FC = () => {
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            
            <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold">Minhas Viagens</h1>
                <p className="text-muted-foreground">Histórico de todas as suas viagens realizadas</p>
              </div>
              
              <TripHistory />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverTrips;
