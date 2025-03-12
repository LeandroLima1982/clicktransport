
import React from 'react';
import { Check, CalendarCheck, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';
import { toast } from 'sonner';

interface BookingCompleteProps {
  bookingReference: string;
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    tripType: string;
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
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Reserva Confirmada!</h2>
        <p className="text-gray-600 mt-2">
          Sua viagem foi reservada com sucesso. Agradecemos sua preferência.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500 mb-1">Código da reserva</div>
        <div className="flex items-center justify-center">
          <span className="text-xl font-bold">{bookingReference}</span>
          <button
            onClick={handleCopyReference}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
            aria-label="Copiar código de reserva"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Veículo:</span>
          <span className="font-medium">{selectedVehicle?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Origem:</span>
          <span className="font-medium">{bookingData.origin}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Destino:</span>
          <span className="font-medium">{bookingData.destination}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Data:</span>
          <span className="font-medium">{formatDate(bookingData.date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Valor total:</span>
          <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
        <CalendarCheck className="h-5 w-5 mx-auto mb-2" />
        <p>
          Uma confirmação foi enviada para seu email com todos os detalhes da reserva.
          Você pode acompanhar o status da sua viagem no seu painel de reservas.
        </p>
      </div>
      
      <div className="pt-4 space-y-3">
        <Button variant="outline" className="w-full" onClick={onClose}>
          Concluir
        </Button>
        
        <Button variant="ghost" className="w-full flex items-center justify-center" disabled>
          <Download className="h-4 w-4 mr-2" />
          Baixar comprovante
        </Button>
      </div>
    </div>
  );
};

export default BookingComplete;
