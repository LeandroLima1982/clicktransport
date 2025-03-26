
import React, { useCallback } from 'react';
import { UserRole } from '@/hooks/auth/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTabBar } from './';
import { MobileVerticalMenu } from './';
import { Link } from 'react-router-dom';
import { NavbarLinks } from '@/components/navbar';
import { UserMenu } from '@/components/navbar';

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
  
  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in">
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Fechar menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col p-6 space-y-6">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-xl font-medium" onClick={onClose}>
              Início
            </Link>
            <button 
              className="text-xl font-medium text-left" 
              onClick={() => {
                if (window.location.pathname !== '/') {
                  window.location.href = '/';
                  // Add small delay to allow navigation to complete
                  setTimeout(() => scrollToSection('solutions-section'), 100);
                } else {
                  scrollToSection('solutions-section');
                }
              }}
            >
              Serviços
            </button>
            <Link to="/about" className="text-xl font-medium" onClick={onClose}>
              Sobre
            </Link>
            <Link to="/contact" className="text-xl font-medium" onClick={onClose}>
              Contato
            </Link>
          </nav>
          
          <div className="mt-auto">
            <UserMenu 
              user={user} 
              userRole={userRole} 
              handleSignOut={handleSignOut} 
              isAuthenticating={isAuthenticating} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
