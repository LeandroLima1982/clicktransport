
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
      
      // SQL melhorado com abordagem mais agressiva para remover todas as referências
      const sqlCommand = `
        -- Desabilitar temporariamente as verificações de restrição
        SET session_replication_role = 'replica';
        
        -- Primeiro remover dados de todas as tabelas dependentes
        TRUNCATE driver_locations CASCADE;
        TRUNCATE driver_ratings CASCADE;
        TRUNCATE financial_metrics CASCADE;
        
        -- Limpar outras tabelas que podem ter chaves estrangeiras
        TRUNCATE service_orders CASCADE;
        TRUNCATE bookings CASCADE;
        
        -- Remover motoristas e manter apenas o registro do sistema
        DELETE FROM drivers 
        WHERE id != '00000000-0000-0000-0000-000000000000';
        
        -- Remover veículos e manter apenas o registro do sistema
        DELETE FROM vehicles 
        WHERE id != '00000000-0000-0000-0000-000000000000';
        
        -- Remover empresas e manter apenas o registro do sistema
        DELETE FROM companies 
        WHERE id != '00000000-0000-0000-0000-000000000000';
        
        -- Reabilitar as verificações de restrição
        SET session_replication_role = 'origin';
        
        -- Resetar a sequência de IDs para tabelas que usam serials (se houver)
        -- ALTER SEQUENCE IF EXISTS driver_id_seq RESTART WITH 1;
        -- ALTER SEQUENCE IF EXISTS vehicle_id_seq RESTART WITH 1;
        -- ALTER SEQUENCE IF EXISTS company_id_seq RESTART WITH 1;
      `;
      
      console.log('Executing comprehensive force cleanup SQL command');
      const { data, error } = await executeSQL(sqlCommand);
      
      if (error) {
        console.error('SQL execution error:', error);
        toast.error('Erro ao executar limpeza forçada', { 
          description: error.message 
        });
        setResult({ 
          success: false, 
          message: `Erro ao executar limpeza forçada: ${error.message}`
        });
      } else {
        console.log('Force cleanup successful:', data);
        toast.success('Limpeza forçada concluída com sucesso');
        setResult({ 
          success: true, 
          message: "Limpeza forçada executada com sucesso. Todos os dados foram removidos."
        });
      }
    } catch (error) {
      console.error("Error during force cleanup:", error);
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
                  <p>Esta é uma operação avançada que usa comandos SQL para forçar a remoção de todos os dados.</p>
                  <p className="font-bold mt-1">Todos os dados serão removidos ignorando restrições de chave estrangeira!</p>
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground mb-4">
                Use a limpeza forçada apenas quando a limpeza padrão falhar. Esta opção 
                ignora as restrições de chave estrangeira e remove todos os dados relacionados.
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
