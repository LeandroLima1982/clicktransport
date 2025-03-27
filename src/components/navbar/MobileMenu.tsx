
import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userRole: string | null;
  handleSignOut: () => void;
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
  const menuLinks = [
    { 
      title: 'Home', 
      href: '/' 
    },
    { 
      title: 'Serviços', 
      href: '/#solutions-section', 
      action: () => {
        document.getElementById('solutions-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    },
    { 
      title: 'Sobre Nós', 
      href: '/about' 
    },
    { 
      title: 'Contato', 
      href: '/contact' 
    },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
        staggerDirection: 1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: { opacity: 1, y: 0 }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with improved blur */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Menu with smoother animation */}
          <motion.div
            className="fixed top-[70px] left-0 right-0 bg-white shadow-lg z-50 rounded-b-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="p-5 space-y-5">
              {menuLinks.map((link) => (
                <motion.div key={link.href} variants={itemVariants} className="transform transition-all duration-200 hover:translate-x-1">
                  {link.action ? (
                    <button
                      onClick={() => {
                        onClose();
                        if (window.location.pathname === '/') {
                          link.action();
                        } else {
                          window.location.href = link.href;
                        }
                      }}
                      className="block w-full text-left py-3 px-4 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {link.title}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      {link.title}
                    </Link>
                  )}
                </motion.div>
              ))}
              
              <div className="border-t border-gray-100 my-4"></div>
              
              {user ? (
                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">
                        {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {user.email}
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleSignOut}
                      disabled={isAuthenticating}
                      className="w-full flex items-center justify-center py-3 px-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors transform active:scale-98"
                    >
                      {isAuthenticating ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <LogOut className="w-5 h-5 mr-2" />
                      )}
                      Sair
                    </button>
                  </motion.div>
                </div>
              ) : (
                <motion.div variants={itemVariants}>
                  <Link
                    to="/auth"
                    className="block w-full py-4 px-6 bg-primary text-white text-center font-medium rounded-xl hover:bg-primary/90 transition-colors transform active:scale-98"
                    onClick={onClose}
                  >
                    Entrar / Registrar
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
