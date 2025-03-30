
import React from 'react';
import StepTransition from './StepTransition';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BookingCompleteStepProps {
  bookingReference: string;
  origin: string;
  destination: string;
  date: Date | undefined;
  selectedVehicle: string | null;
  distanceInfo: { distance: number; duration: number } | null;
  direction: number;
  currentStep: number;
}

const BookingCompleteStep: React.FC<BookingCompleteStepProps> = ({
  bookingReference,
  origin,
  destination,
  date,
  selectedVehicle,
  distanceInfo,
  direction,
  currentStep
}) => {
  const navigate = useNavigate();
  
  // Vehicle data - simplified for this step
  const vehicles = {
    "sedan": { name: "Sedan Executivo", basePrice: 79.90, pricePerKm: 2.10 },
    "suv": { name: "SUV Premium", basePrice: 119.90, pricePerKm: 2.49 },
    "van": { name: "Van Executiva", basePrice: 199.90, pricePerKm: 3.39 }
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
    return vehicle.basePrice + (vehicle.pricePerKm * distanceInfo.distance);
  };

  const getVehicleName = () => {
    if (!selectedVehicle) return "";
    return vehicles[selectedVehicle as keyof typeof vehicles]?.name || "";
  };

  const goToBookings = () => {
    navigate('/bookings');
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="bg-amber-400/20 rounded-full p-3">
            <CheckCircle className="w-10 h-10 text-amber-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white">Reserva Confirmada!</h3>
        <p className="text-white/80 text-sm">
          Sua reserva foi confirmada com sucesso. Em breve você receberá um email com todos os detalhes.
        </p>
        
        <div className="booking-input-container p-4 bg-blue-900/20 rounded-lg overflow-hidden shadow-lg mt-4">
          <div className="text-center">
            <div className="text-xs text-white/70">Código da Reserva</div>
            <div className="text-xl font-bold text-amber-300 font-mono tracking-wider mt-1">{bookingReference}</div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10 text-left">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <div className="text-xs text-white/70">Origem:</div>
                <div className="text-white truncate">{origin}</div>
              </div>
              
              <div>
                <div className="text-xs text-white/70">Destino:</div>
                <div className="text-white truncate">{destination}</div>
              </div>
              
              <div>
                <div className="text-xs text-white/70">Data:</div>
                <div className="text-white">
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Não especificado"}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-white/70">Veículo:</div>
                <div className="text-white">{getVehicleName()}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
              <span className="text-white/70 text-sm">Total:</span>
              <span className="text-lg font-bold text-amber-300">{formatCurrency(calculateTripPrice())}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-5">
          <Button 
            onClick={goToBookings}
            className="rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                      shadow-xl hover:shadow-2xl bg-gradient-to-r from-amber-400 to-amber-300 
                      hover:from-amber-300 hover:to-amber-200 border border-amber-300 px-5"
          >
            <span className="relative z-10 flex items-center justify-center">
              Ver Minhas Reservas
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};

export default BookingCompleteStep;
