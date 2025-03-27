
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Car, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';

interface TripDetailsProps {
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
  };
  estimatedDistance: number;
  estimatedTime: number;
  totalPrice: number;
  formatCurrency: (value: number) => string;
  isCalculatingRoute: boolean;
}

const TripDetails: React.FC<TripDetailsProps> = ({
  selectedVehicle,
  bookingData,
  estimatedDistance,
  estimatedTime,
  totalPrice,
  formatCurrency,
  isCalculatingRoute
}) => {
  const formatEstimatedTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h ${mins > 0 ? `${mins}min` : ''}`
      : `${mins}min`;
  };

  if (isCalculatingRoute) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <div className="text-gray-500">Calculando detalhes da rota...</div>
      </div>
    );
  }

  // Convert dates to strings for messageData
  const messageData = {
    origin: bookingData.origin,
    destination: bookingData.destination,
    date: bookingData.date ? format(bookingData.date, "dd/MM/yyyy") : '',
    time: bookingData.time || '',
    arrivalTime: '', // Optional - estimated arrival time
    returnDate: bookingData.returnDate ? format(bookingData.returnDate, "dd/MM/yyyy") : '',
    returnTime: bookingData.returnTime || '',
    returnArrivalTime: '', // Optional - estimated return arrival time
    duration: estimatedTime,
    tripType: bookingData.tripType,
    passengerData: [],
    creationDate: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Detalhes da Viagem</h3>
        <p className="text-sm text-gray-500">
          Verifique os detalhes da sua solicitação
        </p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center">
              <Car className="mr-2 h-4 w-4 text-primary" />
              Veículo Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            {selectedVehicle && (
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden mr-3"
                  style={{
                    backgroundImage: `url(${selectedVehicle.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!selectedVehicle.image && (
                    <Users className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium">{selectedVehicle.name}</div>
                  <div className="text-xs text-gray-500">{selectedVehicle.description}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div>
              <div className="text-xs text-gray-500">Origem:</div>
              <div className="text-sm font-medium">{bookingData.origin}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">Destino:</div>
              <div className="text-sm font-medium">{bookingData.destination}</div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-500">Distância:</div>
                <div className="text-sm font-medium">{estimatedDistance} km</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500">Tempo estimado:</div>
                <div className="text-sm font-medium">{formatEstimatedTime(estimatedTime)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div>
              <div className="text-xs text-gray-500">Data de ida:</div>
              <div className="text-sm font-medium">
                {bookingData.date 
                  ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'Não especificado'
                }
                {bookingData.time ? ` às ${bookingData.time}` : ''}
              </div>
            </div>
            
            {bookingData.tripType === 'roundtrip' && (
              <div>
                <div className="text-xs text-gray-500">Data de volta:</div>
                <div className="text-sm font-medium">
                  {bookingData.returnDate 
                    ? format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Não especificado'
                  }
                  {bookingData.returnTime ? ` às ${bookingData.returnTime}` : ''}
                </div>
              </div>
            )}
            
            <div>
              <div className="text-xs text-gray-500">Tipo de viagem:</div>
              <div className="text-sm font-medium">
                {bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">Passageiros:</div>
              <div className="text-sm font-medium">{bookingData.passengers}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Valor Estimado
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">
                  {bookingData.tripType === 'roundtrip' 
                    ? 'Total (ida e volta)' 
                    : 'Total'
                  }:
                </div>
              </div>
              
              <div className="text-xl font-bold text-primary">
                {formatCurrency(totalPrice)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
