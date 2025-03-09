
import React from 'react';
import StatsCards from './StatsCards';
import CurrentAssignment from './CurrentAssignment';
import AssignmentTabs from './AssignmentTabs';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardContent: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="mb-6 md:mb-8 space-y-2 animate-fade-in">
        <h1 className="text-xl md:text-2xl font-bold">Bem-vindo, João Motorista</h1>
        <p className="text-muted-foreground">Gerencie sua agenda e atribuições de serviço</p>
      </div>
      
      <div className="space-y-6">
        <div className="animate-slide-in" style={{animationDelay: '0.1s'}}>
          <StatsCards />
        </div>
        
        <div className="animate-slide-in" style={{animationDelay: '0.2s'}}>
          <CurrentAssignment />
        </div>
        
        <div className="animate-slide-in" style={{animationDelay: '0.3s'}}>
          <AssignmentTabs />
        </div>
      </div>
    </main>
  );
};

export default DashboardContent;
