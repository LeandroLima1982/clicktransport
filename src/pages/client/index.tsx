
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Bookings from './Bookings';

const ClientRoutes: React.FC = () => {
  const { userRole } = useAuth();
  
  if (userRole !== 'client') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Routes>
      <Route path="/bookings" element={<Bookings />} />
      <Route path="*" element={<Navigate to="/bookings" replace />} />
    </Routes>
  );
};

export default ClientRoutes;
