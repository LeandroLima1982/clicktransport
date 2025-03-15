
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Vehicle } from './steps/VehicleSelection';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    date: Date | undefined;
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
  onClose: () => void;
}

const BookingComplete: React.FC<BookingCompleteProps> = ({
  bookingReference,
  selectedVehicle,
  bookingData,
  totalPrice,
  formatCurrency,
  onClose
}) => {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
      <p className="text-gray-500 mb-6">Sua reserva foi confirmada com sucesso.</p>
      
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-lg font-bold">Código de Reserva</div>
            <div className="text-3xl font-mono tracking-wider text-primary my-2">{bookingReference}</div>
            <div className="text-sm text-gray-500">Guarde este código para referência futura</div>
          </div>
          
          <div className="border-t border-b py-4 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Veículo:</span>
              <span className="font-medium">{selectedVehicle?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium">
                {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Um email com os detalhes da sua reserva foi enviado para o seu endereço de email.
            </p>
            <p className="text-sm text-gray-500">
              Nossa equipe entrará em contato para confirmar os detalhes da sua viagem.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose} className="w-full">
            Concluir
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingComplete;
