
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AssignmentTabs: React.FC = () => {
  return (
    <Tabs defaultValue="upcoming" className="mb-8">
      <TabsList>
        <TabsTrigger value="upcoming">Próximas Atribuições</TabsTrigger>
        <TabsTrigger value="completed">Concluídas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="py-4">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID do Serviço</p>
                  <p className="font-medium">#CT-{1050 + i}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">Nome do Cliente {i}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data e Hora</p>
                  <p className="font-medium">15 de Maio, 2023 • {i === 1 ? '14:30' : '08:00'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                  <p className="font-medium">Transfer {i === 1 ? 'Corporativo' : 'Aeroporto'}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="completed" className="py-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID do Serviço</p>
                  <p className="font-medium">#CT-{1030 + i}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">Cliente Anterior {i}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data e Hora</p>
                  <p className="font-medium">10 de Maio, 2023 • 09:30</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avaliação</p>
                  <p className="font-medium">⭐ {4 + (i % 2) * 0.5}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AssignmentTabs;
