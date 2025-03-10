
import React from 'react';
import { UserRole } from '@/hooks/auth/types';
import { ClientTabItems } from './';
import { DriverTabItems } from './';
import { CompanyTabItems } from './';
import { AdminTabItems } from './';
import { LoggedOutTabItems } from './';

interface MobileTabBarProps {
  user: any;
  userRole: UserRole;
  onClose: () => void;
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
  user,
  userRole,
  onClose
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-up">
      {user ? (
        // Logged in experience - Role-specific tab bar
        <div className="tab-bar">
          {userRole === 'client' && <ClientTabItems onClose={onClose} />}
          {userRole === 'driver' && <DriverTabItems onClose={onClose} />}
          {userRole === 'company' && <CompanyTabItems onClose={onClose} />}
          {userRole === 'admin' && <AdminTabItems onClose={onClose} />}
        </div>
      ) : (
        // Non-logged in experience
        <LoggedOutTabItems onClose={onClose} />
      )}
      
      {/* Add a swipe indicator for the drawer */}
      <div className="swipe-indicator" onClick={onClose}></div>
    </div>
  );
};

export default MobileTabBar;
