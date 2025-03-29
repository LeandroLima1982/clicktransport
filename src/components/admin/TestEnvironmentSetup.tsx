
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setupTestEnvironment } from '@/services/db/setupTestEnvironment';
import { cleanupAllTestData } from '@/services/db/cleanupTestData';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const TestEnvironmentSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSetup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await setupTestEnvironment();
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error instanceof Error ? result.error.message : "Erro desconhecido");
      }
    } catch (error) {
      console.error("Error setting up test environment:", error);
      setError(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCleanup = async () => {
    try {
      setIsCleaning(true);
      setError(null);
      setSuccess(false);
      
      const result = await cleanupAllTestData();
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error instanceof Error ? result.error.message : "Erro ao limpar dados");
      }
    } catch (error) {
      console.error("Error cleaning test data:", error);
      setError(error instanceof Error ? error.message : "Erro inesperado durante limpeza");
    } finally {
      setIsCleaning(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Ambiente de Teste</CardTitle>
          <CardDescription>
            Configure um ambiente de teste completo com empresas, motoristas e veículos para testar os fluxos de trabalho do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Esta operação irá:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm mb-6">
            <li>Limpar dados de teste anteriores</li>
            <li>Criar duas empresas de transporte com posições na fila</li>
            <li>Adicionar motoristas para cada empresa</li>
            <li>Criar veículos para cada empresa</li>
            <li>Gerar uma amostra de reserva para testes</li>
          </ul>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao configurar ambiente</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>
                Operação realizada com sucesso!
              </AlertDescription>
            </Alert>
          )}
          
          <Separator className="my-6" />
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-6">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Limpeza Profunda</h3>
            <p className="text-xs text-amber-700 mb-4">
              Use esta opção para limpar todos os dados do sistema antes de configurar o ambiente de teste.
              Esta ação remove completamente todos os dados reais e de teste para começar do zero.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCleanup} 
              disabled={isCleaning}
              className="bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando dados...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Todos os Dados
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSetup} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando...
              </>
            ) : (
              "Configurar Ambiente de Teste"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestEnvironmentSetup;
