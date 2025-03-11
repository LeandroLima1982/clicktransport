
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, MapPin, Clock, Users, Car, CreditCard, FileText } from 'lucide-react';
import { Booking } from '@/types/booking';
import BookingStatus from './BookingStatus';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BookingDetailsProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (id: string) => Promise<boolean>;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ 
  booking, 
  isOpen, 
  onClose, 
  onCancel 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
  
  const handleCancel = async () => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      const success = await onCancel(booking.id);
      if (success) onClose();
    }
  };
  
  const canBeCancelled = ['confirmed', 'pending'].includes(booking.status);
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl flex items-center justify-between">
            <span>Reserva {booking.reference_code}</span>
            <BookingStatus status={booking.status} />
          </SheetTitle>
          <SheetDescription>
            Detalhes completos da sua reserva
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-5 py-2">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Valor Total
            </div>
            <div className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.total_price)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Data da Viagem
            </div>
            <div className="font-medium">
              {formatDate(booking.travel_date)} às {formatTime(booking.travel_date)}
            </div>
          </div>
          
          {booking.return_date && (
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground text-sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Data de Retorno
              </div>
              <div className="font-medium">
                {formatDate(booking.return_date)} às {formatTime(booking.return_date)}
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              Origem
            </div>
            <div className="font-medium">
              {booking.origin}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              Destino
            </div>
            <div className="font-medium">
              {booking.destination}
            </div>
          </div>
          
          {booking.vehicle_type && (
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground text-sm">
                <Car className="h-4 w-4 mr-2" />
                Tipo de Veículo
              </div>
              <div className="font-medium">
                {booking.vehicle_type}
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground text-sm">
              <Users className="h-4 w-4 mr-2" />
              Passageiros
            </div>
            <div className="font-medium">
              {booking.passengers || 1}
            </div>
          </div>
          
          {booking.additional_notes && (
            <div className="space-y-1">
              <div className="flex items-center text-muted-foreground text-sm">
                <FileText className="h-4 w-4 mr-2" />
                Observações
              </div>
              <div className="font-medium">
                {booking.additional_notes}
              </div>
            </div>
          )}
        </div>
        
        <SheetFooter className="mt-6">
          <div className="flex w-full space-x-2">
            <SheetClose asChild>
              <Button className="flex-1" variant="outline">Fechar</Button>
            </SheetClose>
            
            {canBeCancelled && (
              <Button 
                className="flex-1" 
                variant="destructive"
                onClick={handleCancel}
              >
                Cancelar Reserva
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDetails;
