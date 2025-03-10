
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Car, MapPin, User } from 'lucide-react';

interface DriverTabItemsProps {
  onClose: () => void;
}

const DriverTabItems: React.FC<DriverTabItemsProps> = ({ onClose }) => {
  return (
    <>
      <Link to="/driver/dashboard" className="tab-item" onClick={onClose}>
        <LayoutDashboard className="h-5 w-5 mb-1" />
        <span className="text-xs">Dashboard</span>
      </Link>
      <Link to="/driver/trips" className="tab-item" onClick={onClose}>
        <Car className="h-5 w-5 mb-1" />
        <span className="text-xs">Viagens</span>
      </Link>
      <Link to="/driver/navigation" className="tab-item" onClick={onClose}>
        <MapPin className="h-5 w-5 mb-1" />
        <span className="text-xs">Mapa</span>
      </Link>
      <Link to="/driver/profile" className="tab-item" onClick={onClose}>
        <User className="h-5 w-5 mb-1" />
        <span className="text-xs">Perfil</span>
      </Link>
    </>
  );
};

export default DriverTabItems;
