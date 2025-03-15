
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Car, Home } from 'lucide-react';

const VehiclesPage = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Veículos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <PageHeader
        title="Gerenciamento de Veículos"
        description="Visualize e gerencie todos os veículos cadastrados no sistema"
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Car className="h-5 w-5 mr-2 text-amber-500" />
          Lista de Veículos
        </h2>
        <p className="text-muted-foreground">
          Esta página está em desenvolvimento. Em breve você poderá gerenciar todos os veículos do sistema.
        </p>
      </div>
    </div>
  );
};

export default VehiclesPage;
