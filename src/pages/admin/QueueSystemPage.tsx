
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import QueueDiagnosticsPanel from '@/components/admin/QueueDiagnosticsPanel';
import QueueHealthWidget from '@/components/admin/QueueHealthWidget';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualAssignment from '@/components/booking/ManualAssignment';

const QueueSystemPage = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader
        title="Sistema de Filas"
        description="Gerenciamento e diagnóstico do sistema de atribuição de reservas"
      />
      
      <Tabs defaultValue="diagnostics">
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostics">Diagnóstico</TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostics">
          <QueueDiagnosticsPanel />
        </TabsContent>
        
        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ManualAssignment />
            
            <Card>
              <CardHeader>
                <CardTitle>Guia de Manutenção</CardTitle>
                <CardDescription>
                  Como manter o sistema de filas funcionando corretamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Fluxo de Atribuição</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Todas as empresas devem ter uma posição de fila válida</li>
                    <li>Quando uma reserva é feita, a empresa com menor posição é selecionada</li>
                    <li>Após a atribuição, a empresa vai para o final da fila</li>
                    <li>O sistema continua rotacionando as atribuições de forma justa</li>
                  </ol>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Problemas Comuns</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Empresas com posição 0 ou nula não entram na rotação</li>
                    <li>Posições duplicadas podem fazer empresas serem puladas</li>
                    <li>Ordem de serviço sem referência à reserva dificulta rastreamento</li>
                  </ul>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Manutenção Regular</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use "Correção Automática" semanalmente</li>
                    <li>Verifique o diagnóstico após períodos de alto volume</li>
                    <li>Reinicie a fila apenas quando necessário</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="health">
          <QueueHealthWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QueueSystemPage;
