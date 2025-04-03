
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSampleBookingAndOrder, createManualServiceOrder } from '@/services/db/generateTestOrders';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TestDataGenerator: React.FC = () => {
  const [isGeneratingBooking, setIsGeneratingBooking] = useState(false);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  
  const handleGenerateBookingAndOrder = async () => {
    try {
      setIsGeneratingBooking(true);
      setError(null);
      setInfoMessage(null);
      
      const result = await generateSampleBookingAndOrder();
      
      if (result.success && result.booking) {
        if (!result.serviceOrder) {
          setInfoMessage(
            "Reserva criada com sucesso, mas não foi possível criar a ordem de serviço devido a restrições de permissão. " +
            "Execute 'Configurar Ambiente de Teste' primeiro para configurar as permissões."
          );
        }
      } else {
        if (result.error instanceof Error) {
          setError(result.error.message);
        } else if (typeof result.error === 'object' && result.error) {
          // Handle Supabase error object
          const supabaseError = result.error as any;
          if (supabaseError.code === '23503' && supabaseError.details?.includes('user_id')) {
            setError(
              "Erro ao criar reserva: Usuário de teste não encontrado. " + 
              "Execute 'Configurar Ambiente de Teste' primeiro na aba 'Configuração' para configurar o ambiente corretamente."
            );
          } else {
            setError(`Erro ao gerar reserva: ${supabaseError.message || JSON.stringify(supabaseError)}`);
          }
        } else {
          setError("Erro ao gerar reserva e ordem: " + (result.error ? String(result.error) : "Erro desconhecido"));
        }
      }
    } catch (error) {
      console.error("Error generating booking and order:", error);
      setError(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsGeneratingBooking(false);
    }
  };
  
  const handleCreateManualOrder = async () => {
    try {
      setIsGeneratingOrder(true);
      setError(null);
      setInfoMessage(null);
      
      const result = await createManualServiceOrder();
      
      if (!result.success) {
        if (result.error instanceof Error) {
          setError(result.error.message);
        } else if (typeof result.error === 'object' && result.error) {
          // Handle Supabase error object
          const supabaseError = result.error as any;
          if (supabaseError.code === 'PGRST204') {
            setError(
              "Erro na estrutura da tabela: Algumas colunas podem estar faltando. " +
              "Este é provavelmente um problema de configuração do banco de dados. " +
              "Execute 'Configurar Ambiente de Teste' primeiro para configurar as tabelas corretamente."
            );
          } else {
            setError(`Erro ao criar ordem manual: ${supabaseError.message || JSON.stringify(supabaseError)}`);
          }
        } else {
          setError("Erro ao criar ordem manual: " + (result.error ? String(result.error) : "Erro desconhecido"));
        }
      }
    } catch (error) {
      console.error("Error creating manual order:", error);
      setError(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsGeneratingOrder(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Dados de Teste</CardTitle>
          <CardDescription>
            Crie dados de teste para facilitar o desenvolvimento e testes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {infoMessage && (
            <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Informação</AlertTitle>
              <AlertDescription className="text-blue-600">
                {infoMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Importante</h3>
            <p className="text-xs text-amber-700 mb-2">
              Para utilizar estas funções corretamente, execute primeiro a opção "Configurar Ambiente de Teste" 
              na aba "Configuração" para inicializar as permissões necessárias.
            </p>
            <p className="text-xs text-amber-700">
              A criação de reservas requer um ambiente corretamente configurado devido a restrições de banco de dados.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Reserva e Ordem de Serviço</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gera uma reserva de cliente e uma ordem de serviço associada que será atribuída automaticamente
              a uma empresa conforme a fila.
            </p>
            <Button 
              onClick={handleGenerateBookingAndOrder} 
              disabled={isGeneratingBooking}
              className="w-full"
            >
              {isGeneratingBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Reserva e Ordem de Serviço"
              )}
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Ordem de Serviço Manual</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cria uma ordem de serviço manual (não vinculada a uma reserva) para a primeira empresa ativa.
            </p>
            <Button 
              onClick={handleCreateManualOrder} 
              disabled={isGeneratingOrder}
              variant="outline"
              className="w-full"
            >
              {isGeneratingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Criar Ordem de Serviço Manual"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDataGenerator;
