
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import VehicleSelection from './steps/VehicleSelection';
import PassengerInfo from './steps/PassengerInfo';
import TripDetails from './steps/TripDetails';
import PaymentSelection from './steps/PaymentSelection';
import BookingConfirmation from './steps/BookingConfirmation';
import BookingComplete from './steps/BookingComplete';
import { useBookings } from '@/hooks/useBookings';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { Vehicle } from './steps/VehicleSelection';

interface BookingStepsProps {
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
    distance?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  "Veículo",
  "Seus Dados",
  "Detalhes",
  "Pagamento",
  "Confirmação"
];

const BookingSteps: React.FC<BookingStepsProps> = ({
  bookingData,
  isOpen,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [passengerData, setPassengerData] = useState<{name: string; phone: string}[]>(
    bookingData.passengerData || [{ name: '', phone: '' }]
  );
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [estimatedDistance, setEstimatedDistance] = useState(bookingData.distance || 0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  
  const { createBooking } = useBookings();
  const isMobile = useIsMobile();
  
  // Dummy payment methods
  const paymentMethods = [
    { id: 'card', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'pix', name: 'Pix', icon: 'qr-code' },
    { id: 'cash', name: 'Dinheiro', icon: 'building' },
    { id: 'transfer', name: 'Transferência Bancária', icon: 'bank' }
  ];
  
  // Fetch vehicles and estimate route on mount
  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      calculateEstimatedRoute();
    }
  }, [isOpen, bookingData]);
  
  const fetchVehicles = () => {
    setIsLoadingVehicles(true);
    
    // Simulating API call with timeout
    setTimeout(() => {
      setVehicles([
        {
          id: 'sedan',
          name: 'Sedan Executivo',
          image: '/vehicle-icon.svg',
          description: 'Confortável para até 4 passageiros',
          capacity: 4,
          basePrice: 79.90,
          pricePerKm: 2.10
        },
        {
          id: 'suv',
          name: 'SUV Premium',
          image: '/vehicle-icon.svg',
          description: 'Espaçoso para até 6 passageiros',
          capacity: 6,
          basePrice: 119.90,
          pricePerKm: 2.49
        },
        {
          id: 'van',
          name: 'Van Executiva',
          image: '/vehicle-icon.svg',
          description: 'Ideal para grupos de até 15 passageiros',
          capacity: 15,
          basePrice: 199.90,
          pricePerKm: 3.39
        }
      ]);
      
      setIsLoadingVehicles(false);
    }, 1000);
  };
  
  const calculateEstimatedRoute = () => {
    if (bookingData.origin && bookingData.destination) {
      setIsCalculatingRoute(true);
      
      // Simulating API call with timeout
      setTimeout(() => {
        // Se já temos uma distância do bookingData, use-a
        const distance = bookingData.distance || Math.floor(Math.random() * 100) + 20;
        const time = Math.floor(distance * 1.2); // Estimando tempo baseado na distância
        
        setEstimatedDistance(distance);
        setEstimatedTime(time);
        setIsCalculatingRoute(false);
      }, 1000);
    }
  };
  
  useEffect(() => {
    // Calculate total price based on selected vehicle
    if (selectedVehicle) {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      if (vehicle) {
        const basePrice = vehicle.basePrice;
        const distancePrice = estimatedDistance * vehicle.pricePerKm;
        let total = basePrice + distancePrice;
        
        // If round trip, double the price
        if (bookingData.tripType === 'roundtrip') {
          total *= 2;
        }
        
        setTotalPrice(total);
      }
    }
  }, [selectedVehicle, estimatedDistance, bookingData.tripType, vehicles]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedVehicle) {
      toast.error('Por favor, selecione um veículo para continuar.');
      return;
    }
    
    if (activeStep === 1) {
      const isValid = validatePassengerData();
      if (!isValid) return;
    }
    
    if (activeStep === 3 && !paymentMethod) {
      toast.error('Por favor, selecione um método de pagamento para continuar.');
      return;
    }
    
    if (activeStep === 4) {
      handleConfirmBooking();
      return;
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const validatePassengerData = () => {
    const requiredPassengers = parseInt(bookingData.passengers);
    if (passengerData.length < requiredPassengers) {
      toast.error(`Por favor, forneça informações para todos os ${requiredPassengers} passageiros.`);
      return false;
    }
    
    for (let i = 0; i < requiredPassengers; i++) {
      if (!passengerData[i]?.name || !passengerData[i]?.phone) {
        toast.error(`Por favor, preencha nome e telefone para o passageiro ${i + 1}.`);
        return false;
      }
      
      // Validação básica de telefone
      const phoneRegex = /^\(?(\d{2})\)?[-.\s]?(\d{4,5})[-.\s]?(\d{4})$/;
      if (!phoneRegex.test(passengerData[i].phone)) {
        toast.error(`Por favor, forneça um número de telefone válido para o passageiro ${i + 1}.`);
        return false;
      }
    }
    
    return true;
  };
  
  const handleConfirmBooking = async () => {
    try {
      const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
      
      if (!selectedVehicleData) {
        toast.error('Veículo não encontrado. Por favor, tente novamente.');
        return;
      }
      
      const bookingPayload = {
        origin: bookingData.origin,
        destination: bookingData.destination,
        travel_date: bookingData.date?.toISOString() || new Date().toISOString(),
        return_date: bookingData.tripType === 'roundtrip' ? bookingData.returnDate?.toISOString() : null,
        trip_type: bookingData.tripType,
        passengers: parseInt(bookingData.passengers),
        passenger_data: JSON.stringify(passengerData.slice(0, parseInt(bookingData.passengers))),
        distance: estimatedDistance,
        duration: estimatedTime,
        vehicle_type: selectedVehicleData.name,
        vehicle_id: selectedVehicleData.id,
        total_price: totalPrice,
        payment_method: paymentMethod,
        travel_time: bookingData.time,
        return_time: bookingData.returnTime,
      };
      
      // Calling the createBooking function from the useBookings hook
      const { booking, error } = await createBooking(bookingPayload);
      
      if (error) {
        toast.error('Ocorreu um erro ao criar sua reserva. Por favor, tente novamente.');
        return;
      }
      
      // If booking was successful
      if (booking) {
        setBookingReference(booking.reference_code);
        setBookingComplete(true);
        setActiveStep(5);
        toast.success('Reserva confirmada com sucesso!');
      }
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Ocorreu um erro ao criar sua reserva. Por favor, tente novamente.');
    }
  };
  
  const handleClose = () => {
    if (bookingComplete) {
      // Reset everything when closing after completion
      setActiveStep(0);
      setSelectedVehicle(null);
      setPaymentMethod(null);
      setBookingComplete(false);
      setBookingReference(null);
    }
    onClose();
  };
  
  const getSelectedVehicleData = () => {
    return vehicles.find(v => v.id === selectedVehicle);
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VehicleSelection
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            formatCurrency={formatCurrency}
            isLoading={isLoadingVehicles}
          />
        );
      case 1:
        return (
          <PassengerInfo
            passengerData={passengerData}
            setPassengerData={setPassengerData}
            passengerCount={parseInt(bookingData.passengers)}
          />
        );
      case 2:
        return (
          <TripDetails
            selectedVehicle={getSelectedVehicleData()}
            bookingData={bookingData}
            estimatedDistance={estimatedDistance}
            estimatedTime={estimatedTime}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            isCalculatingRoute={isCalculatingRoute}
          />
        );
      case 3:
        return (
          <PaymentSelection
            paymentMethods={paymentMethods}
            selectedPaymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            selectedVehicle={getSelectedVehicleData()}
            estimatedDistance={estimatedDistance}
            bookingData={bookingData}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
          />
        );
      case 4:
        return (
          <BookingConfirmation
            selectedVehicle={getSelectedVehicleData()}
            selectedPaymentMethod={paymentMethod}
            paymentMethods={paymentMethods}
            bookingData={bookingData}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            estimatedDistance={estimatedDistance}
            estimatedTime={estimatedTime}
          />
        );
      case 5:
        return (
          <BookingComplete
            bookingReference={bookingReference || ''}
            bookingData={bookingData}
            vehicleName={getSelectedVehicleData()?.name || ''}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="px-1 py-3">
        <div className="flex items-center justify-between mb-1">
          {steps.map((_, index) => (
            <React.Fragment key={index}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeStep === index 
                    ? 'bg-blue-500 text-white font-medium'
                    : activeStep > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {activeStep > index ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-1">
                  <div 
                    className={`h-full ${
                      activeStep > index 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-center">
          {steps.map((step, index) => (
            <div key={index} className="w-16 overflow-hidden" style={{ maxWidth: `${100 / steps.length}%` }}>
              <span className={`
                truncate block ${
                  activeStep === index 
                    ? 'text-blue-500 font-medium'
                    : activeStep > index
                      ? 'text-green-500'
                      : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className={`${isMobile ? 'p-4 max-w-full h-full max-h-[92vh] rounded-t-xl' : 'max-w-2xl'} overflow-hidden flex flex-col sm:h-auto`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-0">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle>
              {activeStep === 5 ? 'Reserva Confirmada!' : 'Complete sua Reserva'}
            </DialogTitle>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="w-8 h-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
          
          {activeStep < 5 && renderStepIndicator()}
        </DialogHeader>
        
        <div className="overflow-auto flex-1 p-1 -mx-1">
          {renderStepContent()}
        </div>
        
        {activeStep < 5 && (
          <div className="mt-6 flex justify-between pt-4 border-t border-gray-100">
            {activeStep > 0 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Voltar
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button
              onClick={handleNext}
              className={activeStep === 4 ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {activeStep === 4 ? 'Confirmar Reserva' : 'Continuar'}
            </Button>
          </div>
        )}
        
        {activeStep === 5 && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleClose}>
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingSteps;
