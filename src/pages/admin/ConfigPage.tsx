
import React from 'react';
import { Button } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TestEnvironmentSetup from '@/components/admin/TestEnvironmentSetup';
import QueueDiagnostics from '@/components/admin/QueueDiagnostics';

const ConfigPage: React.FC = () => {
  const { user, userRole } = useAuth();
  
  if (!user || userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button asChild className="mt-4">
          <Link to="/">Retornar à Página Inicial</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link to="/admin" className="flex items-center text-primary hover:underline mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Configuração do Sistema</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <QueueDiagnostics />
        <TestEnvironmentSetup />
      </div>
    </div>
  );
};

export default ConfigPage;
