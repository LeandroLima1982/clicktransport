
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, Menu, X, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
    >
      <div className="container mx-auto bg-zinc-50 px-0 py-3 md:py-[15px]">
        <div className="flex items-center justify-between px-4 md:px-[40px]">
          <Link to="/" className="flex items-center space-x-2 animate-fade-in">
            <Car className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="text-lg md:text-xl font-bold tracking-tight">
              Click<span className="text-primary">Transfer</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors duration-200 story-link">
              Início
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground/80 hover:text-foreground transition-colors duration-200 flex items-center gap-1">
                Serviços <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <a href="#request-service" className="w-full">Solicitar Serviço</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/services" className="w-full">Nossos Serviços</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors duration-200 story-link">
              Sobre
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-foreground transition-colors duration-200 story-link">
              Contato
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Link to="/auth">
              <Button variant="outline" className="rounded-full px-6 btn-hover-slide">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?register=true">
              <Button className="rounded-full px-6 btn-hover-slide">Cadastrar</Button>
            </Link>
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
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden 
          ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-4 py-4 bg-white/95 backdrop-blur-md shadow-sm">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <a 
              href="#request-service" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solicitar Serviço
            </a>
            <Link 
              to="/about" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link 
              to="/contact" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 border-b border-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
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
    </header>
  );
};

export default Navbar;
