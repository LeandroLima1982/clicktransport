
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { calculateRoute, calculateTripPrice, RouteInfo } from '@/utils/routeUtils';

// Import step components
import VehicleSelection, { Vehicle } from './steps/VehicleSelection';
import TripDetails from './steps/TripDetails';
import PaymentSelection from './steps/PaymentSelection';
import BookingConfirmation from './steps/BookingConfirmation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import BookingComplete from './BookingComplete';

const vehicleOptions: Vehicle[] = [
  {
    id: 1,
    name: 'Sedan Executivo',
    image: '/lovable-uploads/sedan-exec.jpg',
    description: 'Conforto para até 4 passageiros',
    capacity: 4,
    pricePerKm: 2.49,
    basePrice: 120,
  },
  {
    id: 2,
    name: 'SUV Premium',
    image: '/lovable-uploads/suv-premium.jpg',
    description: 'Espaço e conforto para até 6 passageiros',
    capacity: 6,
    pricePerKm: 2.49,
    basePrice: 180,
  },
  {
    id: 3,
    name: 'Van Executiva',
    image: '/lovable-uploads/van-exec.jpg',
    description: 'Ideal para grupos de até 10 passageiros',
    capacity: 10,
    pricePerKm: 2.49,
    basePrice: 250,
  },
];

const paymentMethods = [
  { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card' },
  { id: 'pix', name: 'PIX', icon: 'qr-code' },
  { id: 'bank', name: 'Transferência Bancária', icon: 'bank' },
  { id: 'company', name: 'Faturar para Empresa', icon: 'building' },
];

interface BookingStepsProps {
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
  isOpen: boolean;
  onClose: () => void;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ bookingData, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const { user } = useAuth();

  // Fetch route information when component mounts or booking data changes
  useEffect(() => {
    const fetchRouteData = async () => {
      if (bookingData.origin && bookingData.destination && isOpen) {
        setIsCalculatingRoute(true);
        try {
          const result = await calculateRoute(bookingData.origin, bookingData.destination);
          setRouteInfo(result);
          if (!result) {
            toast.error('Não foi possível calcular a rota. Usando estimativas padrão.');
          }
        } catch (error) {
          console.error('Error fetching route data:', error);
          toast.error('Erro ao calcular rota. Usando estimativas padrão.');
        } finally {
          setIsCalculatingRoute(false);
        }
      }
    };

    fetchRouteData();
  }, [bookingData.origin, bookingData.destination, isOpen]);

  // Fallback values in case API fails
  const estimatedDistance = routeInfo?.distance || 120;
  const estimatedTime = routeInfo?.duration || 95;

  const calculatePrice = () => {
    if (!selectedVehicle) return 0;
    const vehicle = vehicleOptions.find(v => v.id === selectedVehicle);
    if (!vehicle) return 0;
    
    return calculateTripPrice(
      estimatedDistance,
      vehicle.basePrice,
      vehicle.pricePerKm,
      bookingData.tripType === 'roundtrip'
    );
  };

  const totalPrice = calculatePrice();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedVehicle) {
      toast.error('Selecione um veículo para continuar');
      return;
    }
    
    if (currentStep === 3 && !selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento para continuar');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!user) {
        setShowLoginForm(true);
      } else {
        handleSubmitBooking();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    handleSubmitBooking();
  };

  const handleRegisterSuccess = () => {
    setShowRegisterForm(false);
    setShowLoginForm(false);
    handleSubmitBooking();
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulating API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      setBookingReference(reference);
      setBookingComplete(true);
      
      toast.success('Reserva confirmada com sucesso!');
    } catch (error) {
      toast.error('Erro ao confirmar reserva. Tente novamente.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setCurrentStep(1);
    setSelectedVehicle(null);
    setSelectedPaymentMethod(null);
    setBookingComplete(false);
    setBookingReference('');
    setShowLoginForm(false);
    setShowRegisterForm(false);
    onClose();
  };

  const selectedVehicleDetails = vehicleOptions.find(v => v.id === selectedVehicle);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VehicleSelection
            vehicles={vehicleOptions}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleVehicleSelect}
            formatCurrency={formatCurrency}
          />
        );
      case 2:
        return (
          <TripDetails
            selectedVehicle={selectedVehicleDetails}
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
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={handlePaymentMethodSelect}
            selectedVehicle={selectedVehicleDetails}
            estimatedDistance={estimatedDistance}
            bookingData={bookingData}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
          />
        );
      case 4:
        return (
          <BookingConfirmation
            selectedVehicle={selectedVehicleDetails}
            selectedPaymentMethod={selectedPaymentMethod}
            paymentMethods={paymentMethods}
            bookingData={bookingData}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            estimatedDistance={estimatedDistance}
            estimatedTime={estimatedTime}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {showLoginForm ? (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess} 
            onShowRegister={() => {
              setShowLoginForm(false);
              setShowRegisterForm(true);
            }}
          />
        ) : showRegisterForm ? (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess} 
            onShowLogin={() => {
              setShowRegisterForm(false);
              setShowLoginForm(true);
            }}
          />
        ) : bookingComplete ? (
          <BookingComplete
            bookingReference={bookingReference}
            selectedVehicle={selectedVehicleDetails}
            bookingData={bookingData}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            onClose={handleCloseAndReset}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">Finalize sua reserva</div>
              <div className="text-gray-500 mt-1">
                Sua viagem de {bookingData.origin} para {bookingData.destination}
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between mb-8">
                  {['Veículo', 'Detalhes', 'Pagamento', 'Confirmação'].map((step, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center ${index + 1 <= currentStep ? 'text-primary' : 'text-gray-400'}`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                        index + 1 < currentStep ? 'bg-primary text-white' : 
                        index + 1 === currentStep ? 'border-2 border-primary text-primary' : 
                        'border-2 border-gray-300 text-gray-400'
                      }`}>
                        {index + 1 < currentStep ? <CheckCircle className="w-6 h-6" /> : index + 1}
                      </div>
                      <span className="text-xs font-medium">{step}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-8">
                  {renderStepContent()}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center"
                  >
                    {currentStep === 4 ? (
                      isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingSteps;
