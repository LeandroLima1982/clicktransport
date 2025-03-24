
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';

const DestinationsPage = () => {
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
      <DestinationManagement />
    </div>
  );
};

export default DestinationsPage;
