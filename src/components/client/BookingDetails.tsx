
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Booking, BookingStatus as BookingStatusType } from '@/types/booking';
import BookingStatusComponent from './BookingStatus';
import ServiceOrderStatusComponent from './ServiceOrderStatus';
import { ServiceOrderStatus as ServiceOrderStatusType } from '@/types/serviceOrderInput';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  CreditCard,
  Phone,
  AlertTriangle,
  Share2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { shareViaWhatsApp, formatBookingShareMessage } from '@/services/notifications/notificationService';

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (bookingId: string) => Promise<void>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  isOpen,
  onClose,
  onCancel,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm", { locale: ptBR });
    } catch (e) {
      return "";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      setIsCancelling(true);
      try {
        await onCancel(booking.id);
        onClose();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const getPassengerData = () => {
    if (booking.passenger_data) {
      try {
        return typeof booking.passenger_data === 'string'
          ? JSON.parse(booking.passenger_data)
          : booking.passenger_data;
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const passengerData = getPassengerData();
  const isRoundTrip = booking.return_date !== null;

  const handleShareViaWhatsApp = () => {
    const bookingData = {
      origin: booking.origin,
      destination: booking.destination,
      date: booking.travel_date,
      returnDate: booking.return_date,
      time: formatTime(booking.travel_date),
      returnTime: booking.return_date ? formatTime(booking.return_date) : undefined,
      tripType: isRoundTrip ? 'roundtrip' : 'oneway',
      passengerData: passengerData,
      creationDate: format(parseISO(booking.booking_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    };

    const message = formatBookingShareMessage(bookingData, {
      simplified: true, 
      referenceCode: booking.reference_code,
      totalPrice: booking.total_price || 0
    });

    shareViaWhatsApp(message);
  };

  const getContactInfo = () => {
    if (booking.driver_id && booking.driver_phone) {
      return {
        type: 'driver',
        name: booking.driver_name || 'Motorista',
        phone: booking.driver_phone
      };
    } else if (booking.company_id && booking.company_phone) {
      return {
        type: 'company',
        name: booking.company_name || 'Empresa',
        phone: booking.company_phone
      };
    }
    
    return {
      type: 'support',
      name: 'Suporte',
      phone: '+5511999999999'
    };
  };

  const contactInfo = getContactInfo();

  const handleContactViaWhatsApp = () => {
    const phoneNumber = contactInfo.phone.replace(/\D/g, '');
    const message = `Olá, estou entrando em contato sobre a reserva #${booking.reference_code} de ${formatDate(booking.travel_date)} às ${formatTime(booking.travel_date)}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getServiceOrderStatus = (bookingStatus: string): ServiceOrderStatus => {
    // Map booking status to service order status
    switch (bookingStatus) {
      case 'confirmed': return 'created';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle>Detalhes da Reserva</SheetTitle>
          <div className="flex items-center justify-between">
            <span>Reserva #{booking.reference_code}</span>
            <BookingStatusComponent status={booking.status} className="ml-2" />
          </div>
        </SheetHeader>

        <div className="py-4">
          <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareViaWhatsApp}
              className="text-xs flex items-center gap-1"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartilhar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleContactViaWhatsApp}
              className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Falar com {contactInfo.type === 'driver' ? 'Motorista' : 'Empresa'}
            </Button>
            
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
              </Button>
            )}
          </div>

          <ServiceOrderStatusBadge status={getServiceOrderStatus(booking.status)} className="my-4" />

          <div className="space-y-2 mt-4">
            <div 
              className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleSection('datetime')}
            >
              <div className="p-3 flex justify-between items-center">
                <h3 className="font-semibold flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Data e Horário
                </h3>
                {expandedSection === 'datetime' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {expandedSection === 'datetime' && (
                <div className="px-3 pb-3 text-sm space-y-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{formatDate(booking.travel_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium text-primary">{formatTime(booking.travel_date)}</span>
                  </div>
                  {isRoundTrip && booking.return_date && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de retorno:</span>
                        <span>{formatDate(booking.return_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário de retorno:</span>
                        <span className="font-medium text-primary">{formatTime(booking.return_date)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div 
              className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleSection('route')}
            >
              <div className="p-3 flex justify-between items-center">
                <h3 className="font-semibold flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  Trajeto
                </h3>
                {expandedSection === 'route' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {expandedSection === 'route' && (
                <div className="px-3 pb-3 text-sm space-y-2 border-t border-gray-200">
                  <div className="flex items-start mt-2">
                    <MapPin className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Origem:</span>
                      <span className="font-medium">{booking.origin}</span>
                    </div>
                  </div>
                  <div className="flex items-start mt-2">
                    <MapPin className="h-4 w-4 mr-2 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Destino:</span>
                      <span className="font-medium">{booking.destination}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleSection('vehicle')}
            >
              <div className="p-3 flex justify-between items-center">
                <h3 className="font-semibold flex items-center text-sm">
                  <Car className="h-4 w-4 mr-2 text-primary" />
                  Veículo
                </h3>
                {expandedSection === 'vehicle' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {expandedSection === 'vehicle' && (
                <div className="px-3 pb-3 text-sm space-y-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{booking.vehicle_type || "Não especificado"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passageiros:</span>
                    <span>{booking.passengers}</span>
                  </div>
                </div>
              )}
            </div>

            {passengerData.length > 0 && (
              <div 
                className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => toggleSection('passengers')}
              >
                <div className="p-3 flex justify-between items-center">
                  <h3 className="font-semibold flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Passageiros
                  </h3>
                  {expandedSection === 'passengers' ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                {expandedSection === 'passengers' && (
                  <div className="px-3 pb-3 space-y-2 border-t border-gray-200">
                    {passengerData.map((passenger: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded p-2">
                        <div className="font-medium text-sm">{passenger.name}</div>
                        <a 
                          href={`https://wa.me/${passenger.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {passenger.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div 
              className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => toggleSection('payment')}
            >
              <div className="p-3 flex justify-between items-center">
                <h3 className="font-semibold flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  Pagamento
                </h3>
                {expandedSection === 'payment' ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {expandedSection === 'payment' && (
                <div className="px-3 pb-3 text-sm space-y-1 border-t border-gray-200">
                  <div className="flex justify-between font-medium">
                    <span>Valor Total:</span>
                    <span className="text-primary">{formatCurrency(booking.total_price || 0)}</span>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex items-center mt-2 text-amber-600 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Aguardando pagamento</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {booking.additional_notes && (
              <div 
                className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => toggleSection('notes')}
              >
                <div className="p-3 flex justify-between items-center">
                  <h3 className="font-semibold flex items-center text-sm">
                    Observações
                  </h3>
                  {expandedSection === 'notes' ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                {expandedSection === 'notes' && (
                  <div className="px-3 pb-3 text-sm border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{booking.additional_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetails;
