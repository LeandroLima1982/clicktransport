
import React from 'react';
import DriverDashboard from './Dashboard';
import TransitionEffect from '@/components/TransitionEffect';

const DriverPanelPage: React.FC = () => {
  return (
    <TransitionEffect direction="fade" duration={600}>
      <DriverDashboard />
    </TransitionEffect>
  );
};

export default DriverPanelPage;
