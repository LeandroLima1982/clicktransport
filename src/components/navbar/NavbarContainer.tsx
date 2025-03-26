import React, { ReactNode, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
interface NavbarContainerProps {
  children: ReactNode;
  scrolled: boolean;
}
const NavbarContainer: React.FC<NavbarContainerProps> = ({
  children,
  scrolled
}) => {
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
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full
        ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}
        ${isMobile ? 'safe-area-top' : ''}`} style={safeAreaTop ? {
    paddingTop: `${safeAreaTop}px`
  } : {}}>
      <div className="py-3 w-full bg-neutral-50 md:py-[10px] mx-0">
        <div className="w-full px-4 flex items-center justify-between max-w-[1400px] mx-0 my-0 py-0 md:px-[129px]">
          {children}
        </div>
      </div>
    </header>;
};
export default NavbarContainer;