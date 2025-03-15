
import React from 'react';
import CompanyPanel from '@/components/company/CompanyPanel';
import TransitionEffect from '@/components/TransitionEffect';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const CompanyDashboard: React.FC = () => {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  if (!user || userRole !== 'company') {
    return <Navigate to="/auth?type=company" replace />;
  }
  
  return (
    <TransitionEffect>
      <CompanyPanel />
    </TransitionEffect>
  );
};

export default CompanyDashboard;
