
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface BookingCompleteProps {
  bookingReference: string;
  bookingData: {
    origin: string;
    destination: string;
    date?: Date;
    returnDate?: Date;
    tripType: string;
    passengers: string;
    time?: string;
    returnTime?: string;
    passengerData?: Array<{
      name: string;
      phone: string;
    }>;
    distance?: number;
  };
  vehicleName: string;
  totalPrice: number;
  formatCurrency: (value: number) => string;
}

const BookingComplete: React.FC<BookingCompleteProps> = ({
  bookingReference,
  bookingData,
  vehicleName,
  totalPrice,
  formatCurrency
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Não especificado';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="text-center py-4 space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-2">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-1">Reserva Confirmada!</h3>
        <p className="text-gray-500">Sua reserva foi confirmada com sucesso.</p>
      </div>
      
      <Card className="border-green-100 bg-green-50 overflow-hidden">
        <CardContent className="pt-5">
          <div className="text-center mb-4">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Código de Reserva
            </h4>
            <div className="text-2xl font-mono tracking-wider text-green-600 font-bold">
              {bookingReference}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Guarde este código para referência
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-5 px-5">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
            Detalhes da Viagem
          </h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Origem:</span>
              <span className="font-medium">{bookingData.origin}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Destino:</span>
              <span className="font-medium">{bookingData.destination}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium">{formatDate(bookingData.date)}</span>
            </div>
            {bookingData.time && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Horário:</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
            )}
            {bookingData.tripType === 'roundtrip' && (
              <>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Retorno:</span>
                  <span className="font-medium">{formatDate(bookingData.returnDate)}</span>
                </div>
                {bookingData.returnTime && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Horário de Retorno:</span>
                    <span className="font-medium">{bookingData.returnTime}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Tipo:</span>
              <span className="font-medium">
                {bookingData.tripType === 'roundtrip' ? 'Ida e volta' : 'Somente ida'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Veículo:</span>
              <span className="font-medium">{vehicleName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Passageiros:</span>
              <span className="font-medium">{bookingData.passengers}</span>
            </div>
            <div className="flex justify-between py-2 font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 px-4">
        <p>Um e-mail com os detalhes da sua reserva foi enviado.</p>
        <p className="mt-1">Nossa equipe entrará em contato para confirmar os detalhes.</p>
      </div>
    </div>
  );
};

export default BookingComplete;
