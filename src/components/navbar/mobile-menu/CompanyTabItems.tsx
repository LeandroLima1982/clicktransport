
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';

interface CompanyTabItemsProps {
  onClose: () => void;
}

const CompanyTabItems: React.FC<CompanyTabItemsProps> = ({ onClose }) => {
  return (
    <>
      <Link to="/company/dashboard" className="tab-item" onClick={onClose}>
        <LayoutDashboard className="h-5 w-5 mb-1" />
        <span className="text-xs">Dashboard</span>
      </Link>
      <Link to="/company/drivers" className="tab-item" onClick={onClose}>
        <Users className="h-5 w-5 mb-1" />
        <span className="text-xs">Motoristas</span>
      </Link>
      <Link to="/company/calendar" className="tab-item" onClick={onClose}>
        <Calendar className="h-5 w-5 mb-1" />
        <span className="text-xs">Agenda</span>
      </Link>
      <Link to="/company/settings" className="tab-item" onClick={onClose}>
        <Settings className="h-5 w-5 mb-1" />
        <span className="text-xs">Config</span>
      </Link>
    </>
  );
};

export default CompanyTabItems;
