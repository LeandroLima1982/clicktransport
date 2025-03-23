
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Vehicle } from './VehicleSelection';
import { useDestinationsService } from '@/hooks/useDestinationsService';

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
  const { cities, fetchCities } = useDestinationsService();
  const [isCheckingCityDistance, setIsCheckingCityDistance] = useState(false);
  const [usingSavedDistance, setUsingSavedDistance] = useState(false);

  useEffect(() => {
    // Make sure cities are loaded
    if (cities.length === 0) {
      fetchCities();
    }
  }, [fetchCities, cities.length]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Detalhes da Viagem</h3>
      
      {isCalculatingRoute ? (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Calculando rota...
        </div>
      ) : (
        <>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start mb-4">
              <div className="min-w-[24px] mr-3">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Origem</div>
                <div className="font-medium">{bookingData.origin}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="min-w-[24px] mr-3">
                <MapPin className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Destino</div>
                <div className="font-medium">{bookingData.destination}</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Data</span>
              </div>
              <div>{formatDate(bookingData.date)}</div>
              {bookingData.time && (
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{bookingData.time}</span>
                </div>
              )}
            </div>
            
            {bookingData.tripType === 'roundtrip' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="font-medium">Data de Retorno</span>
                </div>
                <div>{formatDate(bookingData.returnDate)}</div>
                {bookingData.returnTime && (
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{bookingData.returnTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Passageiros</span>
              </div>
              <div>{bookingData.passengers}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="font-medium">Distância</span>
              </div>
              <div className="flex items-center">
                <span>{estimatedDistance.toFixed(1)} km</span>
                {usingSavedDistance && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                    Verificada
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">Tempo Estimado</span>
              </div>
              <div>{formatTime(estimatedTime)}</div>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Veículo:</span>
                <span className="ml-2">{selectedVehicle?.name}</span>
              </div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(totalPrice)}
              </div>
            </div>
            {bookingData.tripType === 'roundtrip' && (
              <div className="text-sm text-gray-500 mt-1">*Preço inclui ida e volta</div>
            )}
          </div>
          
          <div className="flex items-start bg-yellow-50 p-4 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-700">Importante</p>
              <p className="text-yellow-600">Os valores são estimados e podem sofrer alterações conforme condições da viagem. Eventuais custos adicionais serão informados previamente.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TripDetails;
