
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSampleBookingAndOrder, createManualServiceOrder } from '@/services/db/generateTestOrders';
import { Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const TestDataGenerator: React.FC = () => {
  const [isGeneratingBooking, setIsGeneratingBooking] = useState(false);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);
  
  const handleGenerateBookingAndOrder = async () => {
    try {
      setIsGeneratingBooking(true);
      await generateSampleBookingAndOrder();
    } catch (error) {
      console.error("Error generating booking and order:", error);
    } finally {
      setIsGeneratingBooking(false);
    }
  };
  
  const handleCreateManualOrder = async () => {
    try {
      setIsGeneratingOrder(true);
      await createManualServiceOrder();
    } catch (error) {
      console.error("Error creating manual order:", error);
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
