
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
  Clock3
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

const Bookings: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { bookings, isLoading, cancelBooking } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  if (!user || userRole !== 'client') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
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
  
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
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
            <h1 className="text-2xl md:text-3xl font-bold">Minhas Reservas</h1>
            <p className="text-muted-foreground">Gerencie todas as suas viagens em um só lugar</p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Reserva
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar reservas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-40">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
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
          <Card className="p-8 text-center">
            <div className="mb-4 text-gray-400">
              {searchTerm || statusFilter !== 'all' ? (
                // No results with filters
                <>
                  <Search className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg mb-2">Nenhuma reserva encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar seus filtros de busca
                  </p>
                </>
              ) : (
                // No bookings at all
                <>
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
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
          <div className="grid gap-4">
            {filteredBookings.map((booking) => {
              const { totalPrice, oneWayPrice, returnPrice, isRoundTrip } = getPriceInfo(booking);
              const passengerCount = getPassengerCount(booking);
              const passengerData = getPassengerData(booking);
              const creationDateTime = formatCreationDateTime(booking.booking_date);
              
              return (
                <Card 
                  key={booking.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <div className="mb-2 md:mb-0">
                      <div className="flex items-center">
                        <span className="font-semibold">{booking.reference_code}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5 mr-1" />
                          <span>
                            Reserva em {creationDateTime.date} às {creationDateTime.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <BookingStatus status={booking.status} />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {isRoundTrip ? 'Viagem de ida e volta' : 'Viagem de ida'}
                      </div>
                      <div className="font-medium">{formatDate(booking.travel_date)}</div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(booking.travel_date)}
                      </div>
                      {isRoundTrip && booking.return_date && (
                        <div className="text-sm mt-1">
                          <span className="text-muted-foreground">Volta: </span>
                          {formatDate(booking.return_date)}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        Trajeto
                      </div>
                      <div className="font-medium truncate">{booking.origin}</div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="truncate">{booking.destination}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-between items-start">
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Car className="h-4 w-4 mr-2" />
                          {booking.vehicle_type || "Veículo"}
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{passengerCount} {passengerCount > 1 ? 'passageiros' : 'passageiro'}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-2 rounded-md">
                        {isRoundTrip ? (
                          <>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Ida:</span>
                              <span>{formatCurrency(oneWayPrice)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Volta:</span>
                              <span>{formatCurrency(returnPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium pt-1 mt-1 border-t border-gray-200">
                              <span>Total:</span>
                              <span className="text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-sm font-medium">
                            <span>Valor:</span>
                            <span className="text-primary">{formatCurrency(totalPrice)}</span>
                          </div>
                        )}
                      </div>
                      
                      {passengerData.length > 0 && (
                        <Collapsible className="w-full">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between text-sm text-primary hover:underline">
                              <span>Ver passageiros</span>
                              <Users className="h-3.5 w-3.5 ml-1" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-2">
                            {passengerData.map((passenger: any, index: number) => (
                              <div key={index} className="bg-gray-50 p-2 rounded-md text-sm">
                                <div className="font-medium">{passenger.name}</div>
                                <a 
                                  href={`https://wa.me/${passenger.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-xs text-green-600 hover:text-green-700 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  {passenger.phone}
                                </a>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        Ver Detalhes
                      </Button>
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
