
import React from 'react';
import CompanyPanel from '@/components/company/CompanyPanel';
import TransitionEffect from '@/components/TransitionEffect';

const CompanyDashboard: React.FC = () => {
  return (
    <TransitionEffect>
      <CompanyPanel />
    </TransitionEffect>
  );
};

export default CompanyDashboard;
