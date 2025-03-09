import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Menu, X } from 'lucide-react';
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 bg-zinc-50">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Click<span className="text-primary">Transfer</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
              Início
            </Link>
            <a href="#request-service" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
              Solicitar Serviço
            </a>
            <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
              Sobre
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors duration-200">
              Contato
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" className="rounded-full px-6">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?register=true">
              <Button className="rounded-full px-6">Cadastrar</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-foreground focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="container mx-auto px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>
              Início
            </Link>
            <a href="#request-service" className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>
              Solicitar Serviço
            </a>
            <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>
              Sobre
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2" onClick={() => setMobileMenuOpen(false)}>
              Contato
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth?register=true" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full">Cadastrar</Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>;
};
export default Navbar;