
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DriverManagement from '@/components/admin/drivers/DriverManagement';

const DriverManagementPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Verify the user is an admin
  React.useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, navigate]);

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <DriverManagement />
    </div>
  );
};

export default DriverManagementPage;
