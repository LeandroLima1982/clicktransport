
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanupAllTestData } from '@/services/db/cleanupTestData';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CleanupTestData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);
  
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
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Aviso</AlertTitle>
            <AlertDescription>
              Esta operação removerá permanentemente os dados de teste. Isso não pode ser desfeito.
            </AlertDescription>
          </Alert>
          
          {result && (
            <Alert variant={result.success ? "success" : "destructive"} className="mb-4">
              <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
              <AlertDescription>
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
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
              "Limpar Todos os Dados de Teste"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CleanupTestData;
