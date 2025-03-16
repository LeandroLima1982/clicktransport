
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setupTestEnvironment } from '@/services/db/setupTestEnvironment';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const TestEnvironmentSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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
              <AlertDescription>
                Erro ao configurar ambiente de teste: {error}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              <AlertDescription>
                Ambiente de teste configurado com sucesso!
              </AlertDescription>
            </Alert>
          )}
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
