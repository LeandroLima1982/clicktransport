
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface TripDetailsProps {
  selectedVehicle: any;
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
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
  if (isCalculatingRoute) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Calculando detalhes da viagem...</h3>
        <div className="flex justify-center">
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Detalhes da viagem</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg text-amber-300">
              <Car className="mr-2 h-5 w-5 text-amber-300" />
              Veículo Selecionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVehicle && (
              <div className="space-y-2">
                <div className="font-semibold text-lg">{selectedVehicle.name}</div>
                <div className="text-white/80">{selectedVehicle.description}</div>
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-amber-200" />
                  <span>Até {selectedVehicle.capacity} passageiros</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg text-amber-300">
              <MapPin className="mr-2 h-5 w-5 text-amber-300" />
              Trajeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-amber-200/80">Origem:</div>
                <div className="font-medium">{bookingData.origin}</div>
              </div>
              <div>
                <div className="text-sm text-amber-200/80">Destino:</div>
                <div className="font-medium">{bookingData.destination}</div>
              </div>
              <div>
                <div className="text-sm text-amber-200/80">Distância estimada:</div>
                <div className="font-medium">{estimatedDistance} km</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg text-amber-300">
              <Calendar className="mr-2 h-5 w-5 text-amber-300" />
              Data e Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-amber-200/80">Data de ida:</div>
                <div className="font-medium">
                  {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                </div>
                {bookingData.time && (
                  <div className="text-sm mt-1">Horário: {bookingData.time}</div>
                )}
              </div>
              {bookingData.tripType === 'roundtrip' && (
                <div>
                  <div className="text-sm text-amber-200/80">Data de volta:</div>
                  <div className="font-medium">
                    {bookingData.returnDate ? format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                  </div>
                  {bookingData.returnTime && (
                    <div className="text-sm mt-1">Horário: {bookingData.returnTime}</div>
                  )}
                </div>
              )}
              <div>
                <div className="text-sm text-amber-200/80">Tipo de viagem:</div>
                <div className="font-medium">
                  {bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#002366]/70 border-amber-300/30 text-white shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg text-amber-300">
              <Clock className="mr-2 h-5 w-5 text-amber-300" />
              Tempo e Custo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-amber-200/80">Tempo estimado:</div>
                <div className="font-medium">{Math.floor(estimatedTime / 60)}h {estimatedTime % 60}min</div>
              </div>
              <div>
                <div className="text-sm text-amber-200/80">Passageiros:</div>
                <div className="font-medium">{bookingData.passengers}</div>
              </div>
              <div>
                <div className="text-sm text-amber-200/80">Valor estimado:</div>
                <div className="font-bold text-lg text-amber-300">{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-white/60">
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
