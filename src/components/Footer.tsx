import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const Footer: React.FC = () => {
  const { dark: darkLogo } = useSiteLogo();
  
  return (
    <footer className="bg-secondary text-white pt-16 pb-8 w-full">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={darkLogo || '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png'} 
                alt="LaTransfer" 
                className="h-8 w-auto"
                onError={(e) => {
                  console.error('Error loading logo in Footer:', e);
                  e.currentTarget.src = '/lovable-uploads/483bbbb6-d9c0-4d56-ac5f-ac6abd2337c0.png';
                }}
              />
            </div>
            <p className="text-gray-300 mb-4">
              A principal plataforma que conecta clientes com empresas de transporte para serviços de transfer corporativo e turístico.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Serviços</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/services/corporate" className="text-gray-300 hover:text-primary transition-colors">
                  Transfer Corporativo
                </Link>
              </li>
              <li>
                <Link to="/services/tourist" className="text-gray-300 hover:text-primary transition-colors">
                  Transfer Turístico
                </Link>
              </li>
              <li>
                <Link to="/services/offshore" className="text-gray-300 hover:text-primary transition-colors">
                  Transfer Offshore
                </Link>
              </li>
              <li>
                <Link to="/services/vip" className="text-gray-300 hover:text-primary transition-colors">
                  Serviços VIP
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Links Rápidos</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-primary transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-primary transition-colors">
                  Termos de Serviço
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <span className="text-gray-300">
                  Av. Rio Branco, 156, Centro<br />
                  Rio de Janeiro, RJ - 20040-901
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <span className="text-gray-300">(21) 99999-9999</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <span className="text-gray-300">contato@latransfer.com.br</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LaTransfer. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/terms" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Termos de Serviço
              </Link>
              <Link to="/cookies" className="text-gray-400 text-sm hover:text-primary transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
