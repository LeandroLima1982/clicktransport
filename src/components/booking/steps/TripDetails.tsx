
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { Vehicle } from './VehicleSelection';

interface TripDetailsProps {
  selectedVehicle: Vehicle | undefined;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
    passengers: string;
  };
  estimatedDistance: number;
  estimatedTime: number;
  totalPrice: number;
  formatCurrency: (value: number) => string;
}

const TripDetails: React.FC<TripDetailsProps> = ({
  selectedVehicle,
  bookingData,
  estimatedDistance,
  estimatedTime,
  totalPrice,
  formatCurrency
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Detalhes da viagem</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Car className="mr-2 h-5 w-5 text-primary" />
              Veículo Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVehicle && (
              <div className="space-y-2">
                <div className="font-semibold text-lg">{selectedVehicle.name}</div>
                <div className="text-gray-600">{selectedVehicle.description}</div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Até {selectedVehicle.capacity} passageiros</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Trajeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Origem:</div>
                <div className="font-medium">{bookingData.origin}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Destino:</div>
                <div className="font-medium">{bookingData.destination}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Distância estimada:</div>
                <div className="font-medium">{estimatedDistance} km</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Data de ida:</div>
                <div className="font-medium">
                  {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                </div>
              </div>
              {bookingData.tripType === 'roundtrip' && (
                <div>
                  <div className="text-sm text-gray-500">Data de volta:</div>
                  <div className="font-medium">
                    {bookingData.returnDate ? format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Tipo de viagem:</div>
                <div className="font-medium">
                  {bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Tempo e Custo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Tempo estimado:</div>
                <div className="font-medium">{Math.floor(estimatedTime / 60)}h {estimatedTime % 60}min</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Passageiros:</div>
                <div className="font-medium">{bookingData.passengers}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Valor estimado:</div>
                <div className="font-bold text-lg text-primary">{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-gray-500">
                  {bookingData.tripType === 'roundtrip' ? '(Inclui ida e volta)' : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetails;
