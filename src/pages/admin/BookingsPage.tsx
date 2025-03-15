
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
import { CalendarCheck, Home } from 'lucide-react';

const BookingsPage = () => {
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
            <BreadcrumbPage>Reservas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <PageHeader
        title="Gerenciamento de Reservas"
        description="Visualize e gerencie todas as reservas realizadas"
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CalendarCheck className="h-5 w-5 mr-2 text-purple-500" />
          Lista de Reservas
        </h2>
        <p className="text-muted-foreground">
          Esta página está em desenvolvimento. Em breve você poderá gerenciar todas as reservas do sistema.
        </p>
      </div>
    </div>
  );
};

export default BookingsPage;
