
import React from 'react';
import { Helmet } from 'react-helmet';
import AdminTabItems from '@/components/admin/AdminTabItems';
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';

const DestinationsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Gerenciamento de Destinos | Painel Admin</title>
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
      
      <AdminTabItems />
      
      <div className="mt-6">
        <DestinationManagement />
      </div>
    </div>
  );
};

export default DestinationsPage;
