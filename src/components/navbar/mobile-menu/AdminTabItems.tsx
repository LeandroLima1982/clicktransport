
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Settings, Building2, FileText, Users, MapPin, TrendingUp } from 'lucide-react';

interface AdminTabItemsProps {
  onClose: () => void;
}

const AdminTabItems: React.FC<AdminTabItemsProps> = ({ onClose }) => {
  return (
    <>
      <Link to="/admin/dashboard" className="tab-item" onClick={onClose}>
        <LayoutDashboard className="h-5 w-5 mb-1" />
        <span className="text-xs">Dashboard</span>
      </Link>
      <Link to="/admin/dashboard?tab=companies" className="tab-item" onClick={onClose}>
        <Building2 className="h-5 w-5 mb-1" />
        <span className="text-xs">Empresas</span>
      </Link>
      <Link to="/admin/dashboard?tab=orders" className="tab-item" onClick={onClose}>
        <FileText className="h-5 w-5 mb-1" />
        <span className="text-xs">Ordens</span>
      </Link>
      <Link to="/admin/dashboard?tab=destinations" className="tab-item" onClick={onClose}>
        <MapPin className="h-5 w-5 mb-1" />
        <span className="text-xs">Destinos</span>
      </Link>
      <Link to="/admin/dashboard?tab=investors" className="tab-item" onClick={onClose}>
        <TrendingUp className="h-5 w-5 mb-1" />
        <span className="text-xs">Investidores</span>
      </Link>
      <Link to="/admin/database-setup" className="tab-item" onClick={onClose}>
        <Settings className="h-5 w-5 mb-1" />
        <span className="text-xs">Sistema</span>
      </Link>
    </>
  );
};

export default AdminTabItems;
