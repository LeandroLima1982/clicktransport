
import React, { useState, useEffect } from 'react';

interface NavbarContainerProps {
  children: React.ReactNode;
  scrolled: boolean;
}

const NavbarContainer: React.FC<NavbarContainerProps> = ({ children, scrolled }) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' 
        : 'bg-white/80 backdrop-blur-sm py-4'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
};

export default NavbarContainer;
