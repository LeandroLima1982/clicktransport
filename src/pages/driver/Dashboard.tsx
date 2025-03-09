
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import DashboardContent from '@/components/driver/DashboardContent';

const DriverDashboard: React.FC = () => {
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            <DashboardContent />
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverDashboard;
