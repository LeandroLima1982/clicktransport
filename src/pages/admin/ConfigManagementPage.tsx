
import React from 'react';
import AdminTabItems from '@/components/admin/AdminTabItems';

const ConfigManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema.
        </p>
      </div>
      
      <AdminTabItems />
      
      <div className="grid gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Configurações</h3>
          <p>Conteúdo em construção.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigManagementPage;
