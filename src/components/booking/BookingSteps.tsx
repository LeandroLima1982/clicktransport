import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { calculateRoute, calculateTripPrice, calculateTripPriceSync, RouteInfo, getVehicleRates, VehicleRate } from '@/utils/routeUtils';
import { createBooking, createServiceOrderFromBooking } from '@/services/booking/bookingService';
import VehicleSelection, { Vehicle } from './steps/VehicleSelection';
import TripDetails from './steps/TripDetails';
import PaymentSelection from './steps/PaymentSelection';
import BookingConfirmation from './steps/BookingConfirmation';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import BookingComplete from './steps/BookingComplete';
import PassengerInfoFields from './PassengerInfoFields';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import MapPreview from './MapPreview';

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
    passengerData?: {
      name: string;
      phone: string;
    }[];
  };
  isOpen: boolean;
  onClose: () => void;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ bookingData, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [passengerData, setPassengerData] = useState<{name: string; phone: string}[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [pendingBooking, setPendingBooking] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const passengerCount = parseInt(bookingData.passengers, 10) || 0;
    const initialData = Array(passengerCount).fill(null).map(() => ({ name: '', phone: '' }));
    setPassengerData(initialData);
    
    fetchVehicleRates();
  }, [bookingData.passengers]);

  const fetchVehicleRates = async () => {
    setIsLoadingVehicles(true);
    try {
      const rates = await getVehicleRates();
      
      const mappedVehicles: Vehicle[] = rates.map(rate => ({
        id: rate.id,
        name: rate.name,
        image: getVehicleImage(rate.id),
        description: getVehicleDescription(rate),
        capacity: rate.capacity || getDefaultCapacity(rate.id),
        pricePerKm: rate.pricePerKm,
        basePrice: rate.basePrice,
      }));
      
      setVehicleOptions(mappedVehicles);
      
      const passengerCount = parseInt(bookingData.passengers, 10) || 1;
      let defaultVehicle = mappedVehicles.find(v => v.capacity >= passengerCount) || mappedVehicles[0];
      setSelectedVehicle(defaultVehicle.id);
    } catch (error) {
      console.error('Error fetching vehicle rates:', error);
      toast.error('Erro ao carregar taxas de veículos. Usando valores padrão.');
      setVehicleOptions([
        {
          id: "sedan",
          name: 'Sedan Executivo',
          image: '/lovable-uploads/sedan-exec.jpg',
          description: 'Conforto para até 4 passageiros',
          capacity: 4,
          pricePerKm: 2.10,
          basePrice: 79.90,
        },
        {
          id: "suv",
          name: 'SUV Premium',
          image: '/lovable-uploads/suv-premium.jpg',
          description: 'Espaço e conforto para até 6 passageiros',
          capacity: 6,
          pricePerKm: 2.49,
          basePrice: 119.90,
        },
        {
          id: "van",
          name: 'Van Executiva',
          image: '/lovable-uploads/van-exec.jpg',
          description: 'Ideal para grupos de até 10 passageiros',
          capacity: 10,
          pricePerKm: 3.39,
          basePrice: 199.90,
        },
      ]);
    } finally {
      setIsLoadingVehicles(false);
    }
  };
  
  const getVehicleImage = (vehicleId: string): string => {
    switch (vehicleId) {
      case 'sedan': return '/lovable-uploads/sedan-exec.jpg';
      case 'suv': return '/lovable-uploads/suv-premium.jpg';
      case 'van': return '/lovable-uploads/van-exec.jpg';
      default: return '/lovable-uploads/sedan-exec.jpg';
    }
  };
  
  const getVehicleDescription = (rate: VehicleRate): string => {
    const capacity = rate.capacity || getDefaultCapacity(rate.id);
    return `Conforto para até ${capacity} passageiros`;
  };
  
  const getDefaultCapacity = (vehicleId: string): number => {
    switch (vehicleId) {
      case 'sedan': return 4;
      case 'suv': return 6;
      case 'van': return 10;
      default: return 4;
    }
  };

  const handleRouteCalculated = (data: { distance: number; duration: number; fare: number }) => {
    setRouteInfo({
      distance: data.distance,
      duration: data.duration,
      geometry: null
    });
    setCalculatedFare(data.fare);
    setIsCalculatingRoute(false);
  };

  const estimatedDistance = routeInfo?.distance || 0;
  const estimatedTime = routeInfo?.duration || 0;

  const calculatePrice = () => {
    if (calculatedFare) {
      return bookingData.tripType === 'roundtrip' ? calculatedFare * 2 : calculatedFare;
    }
    
    if (!selectedVehicle) return 0;
    const vehicle = vehicleOptions.find(v => v.id === selectedVehicle);
    if (!vehicle) return 0;
    
    const distancePrice = estimatedDistance * vehicle.pricePerKm;
    const totalPrice = vehicle.basePrice + distancePrice;
    
    return bookingData.tripType === 'roundtrip' ? totalPrice * 2 : totalPrice;
  };

  const totalPrice = calculatePrice();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setCalculatedFare(null);
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
    
    if (currentStep === 4) {
      const passengerCount = parseInt(bookingData.passengers, 10);
      for (let i = 0; i < passengerCount; i++) {
        if (!passengerData[i]?.name) {
          toast.error(`Por favor, informe o nome do passageiro ${i + 1}.`);
          return;
        }
        
        if (!passengerData[i]?.phone) {
          toast.error(`Por favor, informe o WhatsApp do passageiro ${i + 1}.`);
          return;
        }
      }
      
      if (!user) {
        console.log('User not logged in, setting pending booking and showing login form');
        setPendingBooking(true);
        setShowLoginForm(true);
      } else {
        handleSubmitBooking();
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLoginSuccess = () => {
    console.log('Login successful, handling pending booking:', pendingBooking);
    setShowLoginForm(false);
    
    if (pendingBooking) {
      handleSubmitBooking();
    }
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful, handling pending booking:', pendingBooking);
    setShowRegisterForm(false);
    setShowLoginForm(false);
    
    if (pendingBooking) {
      handleSubmitBooking();
    }
  };

  const handleSubmitBooking = async () => {
    console.log('Submitting booking, user:', user);
    setIsSubmitting(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user || user;
      
      if (!currentUser) {
        console.log('No user available for booking, showing login form');
        setPendingBooking(true);
        setShowLoginForm(true);
        setIsSubmitting(false);
        return;
      }
      
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      const selectedVehicleDetails = vehicleOptions.find(v => v.id === selectedVehicle);
      
      const bookingObject = {
        reference_code: reference,
        origin: bookingData.origin,
        destination: bookingData.destination,
        booking_date: new Date().toISOString(),
        travel_date: bookingData.date ? bookingData.date.toISOString() : new Date().toISOString(),
        return_date: bookingData.returnDate ? bookingData.returnDate.toISOString() : null,
        total_price: totalPrice,
        passengers: parseInt(bookingData.passengers),
        vehicle_type: selectedVehicleDetails?.name || '',
        status: 'confirmed' as const,
        user_id: currentUser.id,
        additional_notes: `${bookingData.time ? 'Horário ida: ' + bookingData.time : ''} 
                          ${bookingData.returnTime ? 'Horário volta: ' + bookingData.returnTime : ''}`
      };
      
      console.log('Creating booking with data:', bookingObject);
      
      const { booking, error } = await createBooking(bookingObject);
      
      if (error) {
        throw error;
      }
      
      if (booking) {
        const { serviceOrder, error: serviceOrderError } = await createServiceOrderFromBooking(booking);
        
        if (serviceOrderError) {
          console.error('Error creating service order:', serviceOrderError);
          toast.error('Reserva confirmada, mas houve um erro ao criar a ordem de serviço', { 
            description: 'Nossa equipe será notificada para resolver o problema.'
          });
        } else {
          console.log('Service order created successfully:', serviceOrder);
          toast.success('Ordem de serviço criada para a empresa de transporte!');
        }
      }
      
      setBookingReference(reference);
      setBookingComplete(true);
      
      toast.success('Reserva confirmada com sucesso!');
      
      setPendingBooking(false);
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Erro ao confirmar reserva. Tente novamente.');
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
    setPendingBooking(false);
    onClose();
    
    if (bookingComplete) {
      navigate('/bookings');
    }
  };

  const selectedVehicleDetails = vehicleOptions.find(v => v.id === selectedVehicle);
  
  const paymentMethods = [
    { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'pix', name: 'PIX', icon: 'qr-code' },
    { id: 'bank', name: 'Transferência Bancária', icon: 'bank' },
    { id: 'company', name: 'Faturar para Empresa', icon: 'building' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-6">
              <MapPreview 
                origin={bookingData.origin} 
                destination={bookingData.destination}
                selectedVehicleId={selectedVehicle || undefined}
                onRouteCalculated={handleRouteCalculated}
              />
            </div>
            
            <VehicleSelection
              vehicles={vehicleOptions}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={handleVehicleSelect}
              formatCurrency={formatCurrency}
              isLoading={isLoadingVehicles}
            />
          </>
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
            bookingData={{...bookingData, passengerData: null}}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Informações dos Passageiros</h3>
            <p className="text-gray-600">Por favor, informe os dados de cada passageiro para finalizar sua reserva.</p>
            
            <PassengerInfoFields
              passengerCount={parseInt(bookingData.passengers)}
              passengerData={passengerData}
              onPassengerDataChange={setPassengerData}
            />
          </div>
        );
      case 5:
        return (
          <BookingConfirmation
            selectedVehicle={selectedVehicleDetails}
            selectedPaymentMethod={selectedPaymentMethod}
            paymentMethods={paymentMethods}
            bookingData={{...bookingData, passengerData: passengerData}}
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
            bookingData={{...bookingData, passengerData: passengerData}}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            onClose={handleCloseAndReset}
          />
        ) : (
          <>
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-bold">Finalize sua reserva</DialogTitle>
              <div className="text-gray-500 mt-1">
                Sua viagem de {bookingData.origin} para {bookingData.destination}
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between mb-8">
                  {['Veículo', 'Detalhes', 'Pagamento', 'Passageiros', 'Confirmação'].map((step, index) => (
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
                    {currentStep === 5 ? (
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
