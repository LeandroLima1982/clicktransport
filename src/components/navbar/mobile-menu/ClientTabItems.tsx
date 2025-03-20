
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Book, Car, User, CreditCard } from 'lucide-react';

interface ClientTabItemsProps {
  onClose: () => void;
}

const ClientTabItems: React.FC<ClientTabItemsProps> = ({ onClose }) => {
  return (
    <>
      <Link to="/" className="tab-item" onClick={onClose}>
        <Home className="h-5 w-5 mb-1" />
        <span className="text-xs">Início</span>
      </Link>
      <Link to="/bookings" className="tab-item" onClick={onClose}>
        <Book className="h-5 w-5 mb-1" />
        <span className="text-xs">Reservas</span>
      </Link>
      <Link to="/#request-service" className="tab-item" onClick={onClose}>
        <Car className="h-5 w-5 mb-1" />
        <span className="text-xs">Solicitar</span>
      </Link>
      <Link to="/profile" className="tab-item" onClick={onClose}>
        <User className="h-5 w-5 mb-1" />
        <span className="text-xs">Perfil</span>
      </Link>
      <Link to="/payment-methods" className="tab-item" onClick={onClose}>
        <CreditCard className="h-5 w-5 mb-1" />
        <span className="text-xs">Pagamento</span>
      </Link>
    </>
  );
};

export default ClientTabItems;
