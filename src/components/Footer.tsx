
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Footer: React.FC = () => {
  const [footerLogoUrl, setFooterLogoUrl] = useState<string>('/lovable-uploads/4426e89f-4ae5-492a-84b3-eb7935af6e46.png');

  useEffect(() => {
    const fetchFooterLogo = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('site_images').select('image_url').eq('section_id', 'footer_logo').single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching footer logo from settings:', error);
          return;
        }
        if (data && data.image_url) {
          setFooterLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading footer logo from settings:', error);
      }
    };
    fetchFooterLogo();
  }, []);

  return (
    <footer className="text-white pt-16 pb-8 w-full bg-blue-950 m-0">
      <div className="full-width-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="flex items-center mb-6">
              <img src={footerLogoUrl} alt="LaTransfer Logo" className="h-10 w-auto" />
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
