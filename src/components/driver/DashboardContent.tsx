
import React from 'react';
import StatsCards from './StatsCards';
import CurrentAssignment from './CurrentAssignment';
import AssignmentTabs from './AssignmentTabs';

const DashboardContent: React.FC = () => {
  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold">Bem-vindo, João Motorista</h1>
        <p className="text-muted-foreground">Gerencie sua agenda e atribuições de serviço</p>
      </div>
      
      <StatsCards />
      <CurrentAssignment />
      <AssignmentTabs />
    </main>
  );
};

export default DashboardContent;
