
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import {
  NavbarContainer,
  NavbarLogo,
  NavbarLinks,
  UserMenu,
  MobileMenu
} from './navbar';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Navbar logging out...');
      await signOut();
      navigate('/', { replace: true });
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <>
      <NavbarContainer scrolled={scrolled}>
        <NavbarLogo />
        
        <div className="hidden md:flex items-center space-x-4">
          <NavbarLinks />
        </div>
        
        <div className="flex items-center space-x-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="hidden md:block">
            <UserMenu 
              user={user} 
              userRole={userRole} 
              handleSignOut={handleSignOut} 
              isAuthenticating={isAuthenticating} 
            />
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-foreground focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </NavbarContainer>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        userRole={userRole}
        handleSignOut={handleSignOut}
        isAuthenticating={isAuthenticating}
      />
    </>
  );
};

export default Navbar;
