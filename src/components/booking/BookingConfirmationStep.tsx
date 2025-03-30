
import React from 'react';
import { Button } from '@/components/ui/button';
import StepTransition from './StepTransition';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, MapPin, Calendar, Users, Car, CreditCard } from 'lucide-react';

interface BookingConfirmationStepProps {
  origin: string;
  destination: string;
  date: Date | undefined;
  returnDate: Date | undefined;
  time?: string;
  returnTime?: string;
  tripType: "oneway" | "roundtrip";
  passengers: string;
  selectedVehicle: string | null;
  selectedPaymentMethod: string | null;
  distanceInfo: { distance: number; duration: number } | null;
  goToPreviousStep: () => void;
  handleSubmitBooking: () => void;
  isSubmitting: boolean;
  canProceedFromStep6: () => boolean;
  direction: number;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const BookingConfirmationStep: React.FC<BookingConfirmationStepProps> = ({
  origin,
  destination,
  date,
  returnDate,
  time,
  returnTime,
  tripType,
  passengers,
  selectedVehicle,
  selectedPaymentMethod,
  distanceInfo,
  goToPreviousStep,
  handleSubmitBooking,
  isSubmitting,
  canProceedFromStep6,
  direction,
  currentStep,
  isFirstStep,
  isLastStep
}) => {
  // Vehicle data - simplified for this step
  const vehicles = {
    "sedan": { name: "Sedan Executivo", basePrice: 79.90, pricePerKm: 2.10 },
    "suv": { name: "SUV Premium", basePrice: 119.90, pricePerKm: 2.49 },
    "van": { name: "Van Executiva", basePrice: 199.90, pricePerKm: 3.39 }
  };

  const paymentMethods = {
    "credit": "Cartão de Crédito",
    "pix": "PIX",
    "bank": "Transferência Bancária",
    "company": "Faturar para Empresa"
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTripPrice = () => {
    if (!selectedVehicle || !distanceInfo) return 0;
    const vehicle = vehicles[selectedVehicle as keyof typeof vehicles];
    const price = vehicle.basePrice + (vehicle.pricePerKm * distanceInfo.distance);
    return tripType === 'roundtrip' ? price * 2 : price;
  };

  const getVehicleName = () => {
    if (!selectedVehicle) return "";
    return vehicles[selectedVehicle as keyof typeof vehicles]?.name || "";
  };

  const getPaymentMethodName = () => {
    if (!selectedPaymentMethod) return "";
    return paymentMethods[selectedPaymentMethod as keyof typeof paymentMethods] || "";
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-2 text-center">Confirmar Reserva</h3>
        
        <div className="booking-input-container p-3 bg-blue-900/20 rounded-lg overflow-hidden shadow-lg">
          <div className="space-y-3">
            <div className="flex items-start text-white">
              <div className="mr-2 mt-1">
                <MapPin className="w-4 h-4 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/70">De:</div>
                <div className="font-medium text-sm">{origin}</div>
                <div className="text-xs text-white/70 mt-1">Para:</div>
                <div className="font-medium text-sm">{destination}</div>
              </div>
            </div>
            
            <div className="flex items-start text-white">
              <div className="mr-2 mt-1">
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/70">Data de ida:</div>
                <div className="font-medium text-sm">
                  {date && time ? `${format(date, "dd/MM/yyyy", { locale: ptBR })} às ${time}` : "Não especificado"}
                </div>
                {tripType === 'roundtrip' && (
                  <>
                    <div className="text-xs text-white/70 mt-1">Data de volta:</div>
                    <div className="font-medium text-sm">
                      {returnDate && returnTime ? `${format(returnDate, "dd/MM/yyyy", { locale: ptBR })} às ${returnTime}` : "Não especificado"}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-white">
              <div className="flex items-start">
                <div className="mr-2 mt-1">
                  <Users className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Passageiros:</div>
                  <div className="font-medium text-sm">{passengers}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-1">
                  <Car className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Veículo:</div>
                  <div className="font-medium text-sm">{getVehicleName()}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-1">
                  <CreditCard className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Pagamento:</div>
                  <div className="font-medium text-sm">{getPaymentMethodName()}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-2 mt-1">
                  <MapPin className="w-4 h-4 text-amber-300" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-white/70">Distância:</div>
                  <div className="font-medium text-sm">{distanceInfo ? `${distanceInfo.distance.toFixed(1)} km` : "Calculando..."}</div>
                </div>
              </div>
            </div>
            
            <div className="pt-2 mt-2 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Valor Total:</span>
                <span className="text-xl font-bold text-amber-300">{formatCurrency(calculateTripPrice())}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-3">
          <Button 
            onClick={goToPreviousStep}
            variant="outline" 
            className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleSubmitBooking} 
            disabled={isSubmitting || !canProceedFromStep6()}
            className="rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                      shadow-xl hover:shadow-2xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 px-4 animate-pulse"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              <span className="relative z-10 flex items-center justify-center">
                Confirmar Agora
              </span>
            )}
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default BookingConfirmationStep;
