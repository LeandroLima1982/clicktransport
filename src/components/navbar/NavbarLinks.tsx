
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavbarLinks: React.FC = () => {
  const location = useLocation();
  
  const links = [
    { name: 'Início', path: '/' },
    { name: 'Serviços', path: '/services' },
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contato', path: '/contact' },
    { name: 'Seja Investidor', path: '/investor/auth' },
    { name: 'Seja Parceiro', path: '/auth?register=true&type=company' },
  ];

  const linkVariants = {
    hover: { 
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <nav className="flex items-center space-x-2">
      {links.map((link) => {
        const isActive = location.pathname === link.path;
        
        return (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            whileHover="hover"
            whileTap="tap"
            variants={linkVariants}
          >
            <Link
              to={link.path}
              className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              {link.name}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="navbar-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30 
                  }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};

export default NavbarLinks;
