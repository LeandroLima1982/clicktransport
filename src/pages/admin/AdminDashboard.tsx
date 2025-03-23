
import React from 'react';
import AdminTabItems from '@/components/admin/AdminTabItems';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visualize informações e estatísticas gerais do sistema.
        </p>
      </div>
      
      <AdminTabItems />
      
      <div className="grid gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Painel Admin</h3>
          <p>Conteúdo do dashboard em construção.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
