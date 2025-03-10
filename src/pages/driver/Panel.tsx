
import React from 'react';
import DriverDashboard from './Dashboard';
import TransitionEffect from '@/components/TransitionEffect';

const DriverPanelPage: React.FC = () => {
  return (
    <TransitionEffect>
      <DriverDashboard />
    </TransitionEffect>
  );
};

export default DriverPanelPage;
