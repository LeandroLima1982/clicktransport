
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">
                Click<span className="text-primary">Transfer</span>
              </span>
            </div>
            <p className="text-foreground/70 mb-4">
              The premier marketplace connecting clients with transportation companies for corporate and tourist transfer services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/services/corporate" className="text-foreground/70 hover:text-primary transition-colors">
                  Corporate Transfer
                </Link>
              </li>
              <li>
                <Link to="/services/tourist" className="text-foreground/70 hover:text-primary transition-colors">
                  Tourist Transfer
                </Link>
              </li>
              <li>
                <Link to="/services/offshore" className="text-foreground/70 hover:text-primary transition-colors">
                  Offshore Transfer
                </Link>
              </li>
              <li>
                <Link to="/services/vip" className="text-foreground/70 hover:text-primary transition-colors">
                  VIP Services
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-foreground/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-foreground/70 hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-foreground/70 hover:text-primary transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/faq" className="text-foreground/70 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-foreground/70 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ClickTransfer. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-foreground/60 text-sm hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-foreground/60 text-sm hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-foreground/60 text-sm hover:text-primary transition-colors">
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
