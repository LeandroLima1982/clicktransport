
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldPlus, Clock, Calendar, BarChart, Building, Clipboard } from 'lucide-react';

export interface LayoutMetadata {
  title: string;
  description: string;
}

export const metadata: LayoutMetadata = {
  title: 'Reservas | Sistema de Administração',
  description: 'Gerenciamento de reservas e agendamentos',
};

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3 xl:flex-row xl:space-y-0 xl:space-x-3">
        <div className="flex-1">
          <div className="flex overflow-auto pb-2 gap-2">
            <Link to="/bookings">
              <Button variant="outline" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Reservas
              </Button>
            </Link>
            <Link to="/bookings/calendar">
              <Button variant="outline" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Calendário
              </Button>
            </Link>
            <Link to="/bookings/assignments">
              <Button variant="outline" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Atribuições
              </Button>
            </Link>
            <Link to="/bookings/management">
              <Button variant="outline" className="flex items-center">
                <ShieldPlus className="h-4 w-4 mr-2" />
                Aprovações
              </Button>
            </Link>
            <Link to="/bookings/orders">
              <Button variant="outline" className="flex items-center">
                <Clipboard className="h-4 w-4 mr-2" />
                Ordens de Serviço
              </Button>
            </Link>
            <Link to="/bookings/stats">
              <Button variant="outline" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Estatísticas
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
