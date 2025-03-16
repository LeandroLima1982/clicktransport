
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { setupTestEnvironment } from '@/services/db/setupTestEnvironment';

const TestEnvironmentSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  
  const handleSetupTestEnvironment = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const { success, error } = await setupTestEnvironment();
      
      if (success) {
        setResult({
          success: true,
          message: 'Ambiente de teste configurado com sucesso!'
        });
      } else {
        setResult({
          success: false,
          message: `Erro ao configurar ambiente de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Error setting up test environment:', error);
      setResult({
        success: false,
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <RefreshCw className="mr-2 h-5 w-5" />
          Configuração de Ambiente de Teste
        </CardTitle>
        <CardDescription>
          Configure um ambiente de teste com empresas, motoristas e veículos para testar o fluxo completo de trabalho
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta ação irá limpar todos os dados existentes (bookings, ordens de serviço, empresas, motoristas e veículos) 
            e configurar um novo ambiente de teste. Use apenas em ambiente de desenvolvimento!
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p>O ambiente de teste incluirá:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>2 empresas de transporte com posições de fila válidas (1 e 2)</li>
            <li>2 motoristas para cada empresa</li>
            <li>2 veículos para cada empresa</li>
          </ul>
          
          <Button 
            onClick={handleSetupTestEnvironment} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando ambiente de teste...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Configurar Ambiente de Teste
              </>
            )}
          </Button>
          
          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {result.success ? (
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <p>{result.message}</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p>{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestEnvironmentSetup;
