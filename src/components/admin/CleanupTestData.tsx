
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanupAllTestData, forceCleanupAllData } from '@/services/db/cleanupTestData';
import { Loader2, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAdminSql } from '@/hooks/useAdminSql';
import { toast } from 'sonner';

const CleanupTestData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isForceLoading, setIsForceLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);
  const { isExecuting, executeSQL } = useAdminSql();
  
  const handleCleanup = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const { success, error } = await cleanupAllTestData();
      
      if (success) {
        setResult({ success: true, message: "Todos os dados de teste foram removidos com sucesso." });
      } else {
        setResult({ 
          success: false, 
          message: error instanceof Error ? error.message : "Erro desconhecido ao limpar dados."
        });
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro inesperado durante a limpeza."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceCleanup = async () => {
    try {
      setIsForceLoading(true);
      setResult(null);
      
      // SQL comando radical para limpar tudo de uma vez usando TRUNCATE com CASCADE
      const sqlCommand = `
        -- Desativar triggers temporariamente
        SET session_replication_role = 'replica';
        
        -- Usar TRUNCATE CASCADE para remover todos dados relacionados de uma vez
        -- Esta abordagem é muito mais eficiente para limpar toda a base de dados de teste
        
        -- Primeiro limpar tabelas dependentes
        TRUNCATE driver_locations CASCADE;
        TRUNCATE driver_ratings CASCADE;
        TRUNCATE financial_metrics CASCADE;
        TRUNCATE service_orders CASCADE;
        TRUNCATE bookings CASCADE;
        
        -- Agora truncar as tabelas principais, mantendo os registros do sistema
        -- Limpar tabela de drivers
        DELETE FROM drivers 
        WHERE id != '00000000-0000-0000-0000-000000000000'
        AND id IS NOT NULL;
        
        -- Limpar tabela de veículos
        DELETE FROM vehicles 
        WHERE id != '00000000-0000-0000-0000-000000000000'
        AND id IS NOT NULL;
        
        -- Limpar tabela de empresas
        DELETE FROM companies 
        WHERE id != '00000000-0000-0000-0000-000000000000'
        AND id IS NOT NULL;
        
        -- Reativar triggers
        SET session_replication_role = 'origin';
      `;
      
      console.log('Executando limpeza forçada radical com TRUNCATE CASCADE');
      const { data, error } = await executeSQL(sqlCommand);
      
      if (error) {
        console.error('Erro na execução SQL:', error);
        toast.error('Erro ao executar limpeza forçada', { 
          description: error.message 
        });
        setResult({ 
          success: false, 
          message: `Erro ao executar limpeza forçada: ${error.message}`
        });
      } else {
        console.log('Limpeza forçada bem-sucedida:', data);
        toast.success('Limpeza forçada concluída com sucesso');
        setResult({ 
          success: true, 
          message: "Limpeza forçada executada com sucesso. Todos os dados foram removidos."
        });
      }
    } catch (error) {
      console.error("Erro durante limpeza forçada:", error);
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro inesperado durante a limpeza forçada."
      });
    } finally {
      setIsForceLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Limpar Dados de Teste</CardTitle>
          <CardDescription>
            Remove todos os dados de teste do sistema, incluindo empresas, motoristas, veículos e ordens de serviço.
            Usuários administradores não serão removidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard">
            <TabsList className="mb-4">
              <TabsTrigger value="standard">Limpeza Padrão</TabsTrigger>
              <TabsTrigger value="force">Limpeza Forçada</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aviso</AlertTitle>
                <AlertDescription>
                  Esta operação removerá permanentemente os dados de teste. Isso não pode ser desfeito.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground mb-4">
                A limpeza padrão remove os dados respeitando restrições de chave estrangeira e pode 
                falhar se houver registros interconectados.
              </p>
              
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={handleCleanup}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Limpando dados...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Dados de Teste
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="force">
              <Alert variant="destructive" className="mb-4">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Alerta de Segurança</AlertTitle>
                <AlertDescription>
                  <p>Esta é uma operação radical que usa TRUNCATE CASCADE para remover todos os dados ignorando completamente as restrições de chave estrangeira.</p>
                  <p className="font-bold mt-1">Todos os dados serão removidos sem possibilidade de recuperação!</p>
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground mb-4">
                Esta limpeza forçada usa TRUNCATE CASCADE, que é uma operação poderosa do banco de dados 
                que ignora todas as restrições de chave estrangeira e remove todos os dados relacionados.
              </p>
              
              <Button
                variant="destructive"
                disabled={isForceLoading || isExecuting}
                onClick={handleForceCleanup}
                className="w-full"
              >
                {isForceLoading || isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando limpeza forçada...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Forçar Remoção de Todos os Dados
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
          
          {result && (
            <>
              <Separator className="my-4" />
              <Alert variant={result.success ? "success" : "destructive"} className="mt-4">
                <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanupTestData;
