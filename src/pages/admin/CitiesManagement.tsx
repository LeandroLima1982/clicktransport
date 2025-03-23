
import React from 'react';
import CityManagement from '@/components/admin/CityManagement';
import AdminTabItems from '@/components/admin/AdminTabItems';

const CitiesManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Cidades</h2>
        <p className="text-muted-foreground">
          Adicione e gerencie cidades disponíveis para reservas e calcule distâncias precisas.
        </p>
      </div>
      
      <AdminTabItems />
      
      <div className="grid gap-6">
        <CityManagement />
      </div>
    </div>
  );
};

export default CitiesManagementPage;
