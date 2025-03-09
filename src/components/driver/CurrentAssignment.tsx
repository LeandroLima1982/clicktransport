
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Car, CheckCircle, XCircle, MapPin } from 'lucide-react';

const CurrentAssignment: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Atribuição Atual</h2>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID do Serviço</p>
                  <p className="font-medium">#CT-1042</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">Sarah Johnson</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                  <p className="font-medium">Transfer Corporativo</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data e Hora</p>
                  <p className="font-medium">15 de Maio, 2023 • 09:30</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local de Embarque</p>
                    <p className="font-medium">Rua Principal, 123, Rio de Janeiro</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destino</p>
                    <p className="font-medium">Aeroporto Internacional do Galeão, Terminal 2</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium mb-2">Observações</h3>
                <p className="text-sm">Cliente prefere conversação mínima e tem duas malas grandes. Por favor, chegue 10 minutos antes.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Atualizar Status</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Chegou ao Local</span>
                  </Button>
                  <Button variant="outline" className="space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Iniciou Viagem</span>
                  </Button>
                  <Button className="space-x-2 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Concluir Viagem</span>
                  </Button>
                  <Button variant="destructive" className="space-x-2">
                    <XCircle className="h-4 w-4" />
                    <span>Problema/Cancelar</span>
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Contato</h3>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">Ligar para Cliente</Button>
                  <Button variant="outline" size="sm">Mensagem</Button>
                  <Button variant="outline" size="sm">Suporte</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentAssignment;
