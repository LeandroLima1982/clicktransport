
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TestDataGenerator: React.FC = () => {
  const [isGeneratingTestOrder, setIsGeneratingTestOrder] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);

  const generateTestOrder = async () => {
    setIsGeneratingTestOrder(true);
    
    try {
      // Dynamically import to avoid circular dependencies
      const { generateSampleBookingAndOrder } = await import('@/services/db/generateTestOrders');
      const result = await generateSampleBookingAndOrder();
      
      // Check if result exists and has the error property
      if (result && result.error) {
        toast.error(`Erro ao gerar ordem de teste: ${result.error.message}`);
      } else if (result && result.serviceOrder) {
        toast.success(`Ordem de teste gerada com sucesso: ${result.serviceOrder.id}`);
        setGeneratedOrderId(result.serviceOrder.id);
      } else {
        toast.error('Erro ao gerar ordem de teste: resultado inesperado');
      }
    } catch (error) {
      console.error('Error generating test order:', error);
      toast.error(`Erro ao gerar ordem de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingTestOrder(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Gerar Dados de Teste</h2>
      
      <Button 
        onClick={generateTestOrder} 
        disabled={isGeneratingTestOrder}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isGeneratingTestOrder ? 'Gerando...' : 'Gerar Ordem de Teste'}
      </Button>
      
      {generatedOrderId && (
        <div className="mt-4">
          <p>Ordem de Serviço Gerada com ID: {generatedOrderId}</p>
        </div>
      )}
    </div>
  );
};

export default TestDataGenerator;
