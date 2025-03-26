
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavbarLinks: React.FC = () => {
  return (
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
  );
};

export default NavbarLinks;
