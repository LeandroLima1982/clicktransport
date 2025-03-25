
import React from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SystemUpdateChat from '@/components/admin/SystemUpdateChat';

const SystemUpdatePage: React.FC = () => {
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
      <h1 className="text-3xl font-bold mb-8">Atualização do Sistema</h1>
      <p className="text-muted-foreground mb-6">
        Use este chat para solicitar atualizações e melhorias no sistema. As atualizações serão implementadas diretamente no painel de administração.
      </p>
      
      <div className="grid grid-cols-1 gap-8">
        <SystemUpdateChat />
      </div>
    </div>
  );
};

export default SystemUpdatePage;
