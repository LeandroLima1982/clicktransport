
import React, { ReactNode } from 'react';

interface NavbarContainerProps {
  children: ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
    >
      <div className="container mx-auto bg-zinc-50 px-0 py-3 md:py-[15px]">
        <div className="flex items-center justify-between px-4 md:px-[40px]">
          {children}
        </div>
      </div>
    </header>
  );
};

export default NavbarContainer;
