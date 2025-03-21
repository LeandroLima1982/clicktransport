
import React from 'react';
import { Button } from '@/components/ui/button';
import { Vehicle } from './VehicleSelection';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Calendar, Copy, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    passengers: string;
    time?: string;
    returnTime?: string;
    passengerData?: {
      name: string;
      phone: string;
    }[];
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
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(bookingReference);
    toast.success('Código de reserva copiado para a área de transferência');
  };

  return (
    <div className="space-y-6 py-2">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold">Reserva Confirmada!</h3>
        <p className="text-gray-500 mt-1">Sua viagem foi agendada com sucesso</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Código da Reserva</h4>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center" 
            onClick={handleCopyReference}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </Button>
        </div>
        <div className="text-2xl text-center font-mono bg-white p-3 rounded border">
          {bookingReference}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-1 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-500" />
            Detalhes da Viagem
          </h4>
          <div className="pl-7 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Origem:</span>
              <span className="font-medium">{bookingData.origin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Destino:</span>
              <span className="font-medium">{bookingData.destination}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-1 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            Data e Horário
          </h4>
          <div className="pl-7 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium">{formatDate(bookingData.date)}</span>
            </div>
            {bookingData.time && (
              <div className="flex justify-between">
                <span className="text-gray-500">Horário:</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Informações</h4>
          <div className="pl-7 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Veículo:</span>
              <span className="font-medium">{selectedVehicle?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Passageiros:</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor:</span>
              <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Você receberá um email com todos os detalhes da sua reserva. 
          Você também pode acompanhar sua reserva a qualquer momento em "Minhas Reservas".
        </p>
        <Button onClick={onClose} className="w-full">
          Ir para Minhas Reservas
        </Button>
      </div>
    </div>
  );
};

export default BookingComplete;
