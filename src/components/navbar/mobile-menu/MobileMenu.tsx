
import React from 'react';
import { UserRole } from '@/hooks/auth/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTabBar } from './';
import { MobileVerticalMenu } from './';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: UserRole;
  handleSignOut: () => Promise<void>;
  isAuthenticating: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  userRole,
  handleSignOut,
  isAuthenticating
}) => {
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;

  // If on mobile, use bottom tab bar style nav
  if (isMobile) {
    return (
      <MobileTabBar 
        user={user} 
        userRole={userRole} 
        onClose={onClose}
      />
    );
  }

  // For larger screens, use the existing vertical menu
  return (
    <MobileVerticalMenu
      user={user}
      userRole={userRole}
      handleSignOut={handleSignOut}
      isAuthenticating={isAuthenticating}
      onClose={onClose}
    />
  );
};

export default MobileMenu;
