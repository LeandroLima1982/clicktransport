
import React from 'react';
import { CheckCircle, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface BookingCompleteProps {
  bookingReference: string; // Changed from referenceCode to bookingReference
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: string;
    passengers: string;
    time?: string;
    returnTime?: string;
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
  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">Reserva Confirmada!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sua viagem foi agendada com sucesso
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center mb-3">
          <div className="text-sm text-gray-500">Código da Reserva</div>
          <div className="text-xl font-bold text-blue-600">{bookingReference}</div>
        </div>
        
        <div className="space-y-3 text-left">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500">De</div>
              <div className="text-sm font-medium">{bookingData.origin}</div>
              <div className="text-xs text-gray-500 mt-2">Para</div>
              <div className="text-sm font-medium">{bookingData.destination}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500">Data e Hora</div>
              <div className="text-sm font-medium">
                {bookingData.date ? (
                  <>
                    {format(bookingData.date, "dd 'de' MMMM", { locale: ptBR })}
                    {bookingData.time ? ` às ${bookingData.time}` : ''}
                  </>
                ) : (
                  'Data não especificada'
                )}
              </div>
              
              {bookingData.tripType === 'roundtrip' && bookingData.returnDate && (
                <>
                  <div className="text-xs text-gray-500 mt-2">Retorno</div>
                  <div className="text-sm font-medium">
                    {format(bookingData.returnDate, "dd 'de' MMMM", { locale: ptBR })}
                    {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <Users className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <div className="text-xs text-gray-500">Detalhes</div>
              <div className="text-sm font-medium">
                {vehicleName} • {bookingData.passengers} {parseInt(bookingData.passengers) === 1 ? 'passageiro' : 'passageiros'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-1">Valor Total</div>
        <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</div>
      </div>
      
      <div className="text-sm text-gray-500 space-y-2">
        <p>Um email com os detalhes da sua reserva foi enviado.</p>
        <p>Para verificar sua reserva, acesse o menu "Minhas Reservas".</p>
      </div>
    </div>
  );
};

export default BookingComplete;
