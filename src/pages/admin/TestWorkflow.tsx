
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QueueDiagnostics from '@/components/admin/QueueDiagnostics';
import TestEnvironmentSetup from '@/components/admin/TestEnvironmentSetup';
import { CheckCircle2, Building2, LayoutGrid, ServerOff, Trash2 } from 'lucide-react';
import BookingAssignmentDiagnostics from '@/components/admin/BookingAssignmentDiagnostics';
import TestDataGenerator from '@/components/admin/TestDataGenerator';
import TransitionEffect from '@/components/TransitionEffect';
import CleanupTestData from '@/components/admin/CleanupTestData';

const TestWorkflow: React.FC = () => {
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Ambiente de Testes</h1>
        <p className="text-muted-foreground mb-8">
          Ferramentas para testar e diagnosticar fluxos de trabalho do sistema
        </p>
        
        <Tabs defaultValue="setup">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="setup" className="flex items-center">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Gerar Dados
            </TabsTrigger>
            <TabsTrigger value="clean" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Dados
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              Filas
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center">
              <ServerOff className="mr-2 h-4 w-4" />
              Diagnósticos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <TestEnvironmentSetup />
          </TabsContent>
          
          <TabsContent value="generate">
            <TestDataGenerator />
          </TabsContent>
          
          <TabsContent value="clean">
            <CleanupTestData />
          </TabsContent>
          
          <TabsContent value="queue">
            <QueueDiagnostics />
          </TabsContent>
          
          <TabsContent value="diagnostics">
            <BookingAssignmentDiagnostics />
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default TestWorkflow;
