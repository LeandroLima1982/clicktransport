
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Settings } from 'lucide-react';

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
      <Link to="/admin/database-setup" className="tab-item" onClick={onClose}>
        <Settings className="h-5 w-5 mb-1" />
        <span className="text-xs">Database</span>
      </Link>
    </>
  );
};

export default AdminTabItems;
