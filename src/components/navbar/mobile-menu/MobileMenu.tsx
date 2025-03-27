
import React, { useCallback } from 'react';
import { UserRole } from '@/hooks/auth/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTabBar } from './';
import { MobileVerticalMenu } from './';
import { Link } from 'react-router-dom';
import { NavbarLinks } from '@/components/navbar';
import { UserMenu } from '@/components/navbar';
import { X } from 'lucide-react';

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
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col p-6 space-y-6">
          <nav className="flex flex-col space-y-5">
            <Link to="/" className="text-xl font-medium transition-colors hover:text-amber-500" onClick={onClose}>
              Início
            </Link>
            <button 
              className="text-xl font-medium text-left transition-colors hover:text-amber-500" 
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
            <Link to="/about" className="text-xl font-medium transition-colors hover:text-amber-500" onClick={onClose}>
              Sobre
            </Link>
            <Link to="/contact" className="text-xl font-medium transition-colors hover:text-amber-500" onClick={onClose}>
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
