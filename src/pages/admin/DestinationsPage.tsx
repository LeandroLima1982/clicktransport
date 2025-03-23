
import React, { useEffect } from 'react';
import AdminTabItems from '@/components/admin/AdminTabItems';
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';

const DestinationsPage = () => {
  // Set document title directly
  useEffect(() => {
    document.title = "Gerenciamento de Destinos | Painel Admin";
    return () => {
      // Reset title on unmount if needed
      document.title = "Painel Admin";
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
      
      <AdminTabItems />
      
      <div className="mt-6">
        <DestinationManagement />
      </div>
    </div>
  );
};

export default DestinationsPage;
