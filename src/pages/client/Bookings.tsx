
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Plus, 
  ArrowLeft,
  CreditCard,
  Search,
  Filter,
  Users,
  Phone,
  Clock3,
  Share2,
  MessageSquare
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useBookings } from '@/hooks/useBookings';
import BookingStatus from '@/components/client/BookingStatus';
import BookingDetails from '@/components/client/BookingDetails';
import { Booking } from '@/types/booking';
import { useIsMobile } from '@/hooks/use-mobile';
import { shareViaWhatsApp, formatBookingShareMessage } from '@/services/notifications/notificationService';

const Bookings: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { bookings, isLoading, cancelBooking } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const isMobile = useIsMobile();
  
  if (!user || userRole !== 'client') {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Acesso Restrito</h2>
        <p className="mb-6">Você precisa estar logado como cliente para acessar esta página.</p>
        <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
      </div>
    );
  }
  
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
  
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const filteredBookings = bookings.filter(booking => {
    // Filter by search term
    const matchesSearch = 
      booking.reference_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Helper to get passenger count
  const getPassengerCount = (booking: Booking) => {
    if (booking.passenger_data) {
      try {
        const data = typeof booking.passenger_data === 'string' 
          ? JSON.parse(booking.passenger_data) 
          : booking.passenger_data;
        return data.length;
      } catch (e) {
        return booking.passengers || 1;
      }
    }
    return booking.passengers || 1;
  };
  
  // Helper to get parsed passenger data
  const getPassengerData = (booking: Booking) => {
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
  
  // Helper to format creation date and time
  const formatCreationDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
      const formattedTime = format(date, "HH:mm", { locale: ptBR });
      return { date: formattedDate, time: formattedTime };
    } catch (e) {
      return { date: "", time: "" };
    }
  };
  
  // Helper to calculate price breakdown
  const getPriceInfo = (booking: Booking) => {
    const totalPrice = booking.total_price || 0;
    const isRoundTrip = booking.return_date !== null;
    const oneWayPrice = isRoundTrip ? totalPrice / 2 : totalPrice;
    const returnPrice = isRoundTrip ? totalPrice / 2 : 0;
    
    return { totalPrice, oneWayPrice, returnPrice, isRoundTrip };
  };

  // Handle sharing via WhatsApp
  const handleShareBooking = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const passengerData = getPassengerData(booking);
    const isRoundTrip = booking.return_date !== null;
    
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

  // Function to get relevant contact info (driver or company)
  const getContactInfo = (booking: Booking) => {
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
    
    // Default fallback
    return {
      type: 'support',
      name: 'Suporte',
      phone: '+5511999999999' // Replace with actual support phone
    };
  };

  // Function to contact via WhatsApp
  const handleContact = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const contactInfo = getContactInfo(booking);
    const phoneNumber = contactInfo.phone.replace(/\D/g, '');
    const message = `Olá, estou entrando em contato sobre a reserva #${booking.reference_code} de ${formatDate(booking.travel_date)} às ${formatTime(booking.travel_date)}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-4 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl md:text-2xl font-bold">Minhas Reservas</h1>
            <p className="text-muted-foreground text-sm">Gerencie suas viagens em um só lugar</p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="mt-3 md:mt-0"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar reservas..."
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-40">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="h-9">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="mb-4 text-gray-400">
              {searchTerm || statusFilter !== 'all' ? (
                // No results with filters
                <>
                  <Search className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-lg mb-2">Nenhuma reserva encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar seus filtros de busca
                  </p>
                </>
              ) : (
                // No bookings at all
                <>
                  <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-lg mb-2">Você ainda não possui reservas</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Faça sua primeira reserva agora mesmo!
                  </p>
                  <Button onClick={() => navigate('/')}>Nova Reserva</Button>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredBookings.map((booking) => {
              const { totalPrice, oneWayPrice, returnPrice, isRoundTrip } = getPriceInfo(booking);
              const passengerCount = getPassengerCount(booking);
              const creationDateTime = formatCreationDateTime(booking.booking_date);
              const contactInfo = getContactInfo(booking);
              
              return (
                <Card 
                  key={booking.id} 
                  className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div className="mb-1 sm:mb-0">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="font-semibold text-sm">{booking.reference_code}</span>
                        <span className="mx-1 text-gray-400 text-xs">•</span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock3 className="h-3 w-3 mr-1" />
                          <span>{creationDateTime.date}</span>
                        </div>
                      </div>
                    </div>
                    <BookingStatus status={booking.status} size="sm" />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {isRoundTrip ? 'Ida e volta' : 'Somente ida'}
                      </div>
                      <div className="font-medium text-sm">{formatDate(booking.travel_date)}</div>
                      <div className="flex items-center text-xs">
                        <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {formatTime(booking.travel_date)}
                      </div>
                      {isRoundTrip && booking.return_date && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Volta: </span>
                          {formatDate(booking.return_date)} às {formatTime(booking.return_date)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        Trajeto
                      </div>
                      <div className="font-medium text-sm truncate">{booking.origin}</div>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="truncate">{booking.destination}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-between items-start">
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <Car className="h-3.5 w-3.5 mr-1" />
                          {booking.vehicle_type || "Veículo"}
                        </div>
                        <div className="flex items-center text-xs">
                          <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{passengerCount} {passengerCount > 1 ? 'passageiros' : 'passageiro'}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded-md">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Valor:</span>
                          <span className="text-primary">{formatCurrency(totalPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-xs flex-1 px-1"
                          onClick={(e) => handleShareBooking(booking, e)}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartilhar
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-xs flex-1 px-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => handleContact(booking, e)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contato
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            isOpen={!!selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancel={cancelBooking}
          />
        )}
      </div>
    </TransitionEffect>
  );
};

export default Bookings;
