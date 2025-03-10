
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, User, LogOut } from 'lucide-react';

interface LoggedOutTabItemsProps {
  onClose: () => void;
}

const LoggedOutTabItems: React.FC<LoggedOutTabItemsProps> = ({ onClose }) => {
  return (
    <div className="tab-bar">
      <Link to="/" className="tab-item" onClick={onClose}>
        <Home className="h-5 w-5 mb-1" />
        <span className="text-xs">Início</span>
      </Link>
      <a href="#request-service" className="tab-item" onClick={onClose}>
        <Car className="h-5 w-5 mb-1" />
        <span className="text-xs">Solicitar</span>
      </a>
      <Link to="/auth?type=client" className="tab-item" onClick={onClose}>
        <User className="h-5 w-5 mb-1" />
        <span className="text-xs">Login</span>
      </Link>
      <Link to="/auth?register=true" className="tab-item" onClick={onClose}>
        <LogOut className="h-5 w-5 mb-1" />
        <span className="text-xs">Cadastro</span>
      </Link>
    </div>
  );
};

export default LoggedOutTabItems;
