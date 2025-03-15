
import React from 'react';
import DriverPanel from '@/components/driver/DriverPanel';
import TransitionEffect from '@/components/TransitionEffect';

const DriverPanelPage: React.FC = () => {
  return (
    <TransitionEffect>
      <DriverPanel />
    </TransitionEffect>
  );
};

export default DriverPanelPage;
