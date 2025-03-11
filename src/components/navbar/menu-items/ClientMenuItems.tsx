
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, CreditCard } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const ClientMenuItems = () => {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link to="/bookings" className="w-full">
          <Calendar className="h-4 w-4 mr-2" />
          Minhas Reservas
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/profile" className="w-full">
          <User className="h-4 w-4 mr-2" />
          Meu Perfil
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/payment-methods" className="w-full">
          <CreditCard className="h-4 w-4 mr-2" />
          Métodos de Pagamento
        </Link>
      </DropdownMenuItem>
    </>
  );
};

export default ClientMenuItems;
