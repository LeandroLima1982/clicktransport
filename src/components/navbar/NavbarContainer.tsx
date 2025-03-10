
import React, { ReactNode, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarContainerProps {
  children: ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  const isMobile = useIsMobile();
  const [safeAreaTop, setSafeAreaTop] = useState(0);
  
  // Detect safe area insets for newer mobile devices
  useEffect(() => {
    if (isMobile) {
      // Try to get the safe area top value if available
      const safeAreaValue = getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0px';
      setSafeAreaTop(parseInt(safeAreaValue, 10) || 0);
    }
  }, [isMobile]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}
        ${isMobile ? 'safe-area-top' : ''}`}
      style={safeAreaTop ? { paddingTop: `${safeAreaTop}px` } : {}}
    >
      <div className={`container mx-auto ${isMobile ? 'px-0 py-2' : 'px-0 py-3 md:py-[15px]'}`}>
        <div className="flex items-center justify-between px-4 md:px-[40px]">
          {children}
        </div>
      </div>
    </header>
  );
};

export default NavbarContainer;
