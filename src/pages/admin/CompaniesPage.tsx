
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
import { Building, Home } from 'lucide-react';
import CompanyManagement from '@/components/admin/CompanyManagement';

const CompaniesPage = () => {
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
            <BreadcrumbPage>Empresas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <PageHeader
        title="Gerenciamento de Empresas"
        description="Visualize, cadastre e gerencie todas as empresas parceiras"
      />
      
      <CompanyManagement />
    </div>
  );
};

export default CompaniesPage;
