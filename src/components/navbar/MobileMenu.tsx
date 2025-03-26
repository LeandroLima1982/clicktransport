
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
    { title: 'Home', href: '/' },
    { title: 'Serviços', href: '/services' },
    { title: 'Sobre Nós', href: '/about' },
    { title: 'Contato', href: '/contact' },
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            className="fixed top-[70px] left-0 right-0 bg-white shadow-lg z-50 rounded-b-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="p-4 space-y-4">
              {menuLinks.map((link) => (
                <motion.div key={link.href} variants={itemVariants}>
                  <Link
                    to={link.href}
                    className="block py-3 px-4 text-lg font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    {link.title}
                  </Link>
                </motion.div>
              ))}
              
              <div className="border-t border-gray-100 my-4"></div>
              
              {user ? (
                <div className="space-y-3">
                  <motion.div variants={itemVariants} className="p-4 bg-gray-50 rounded-lg">
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
                      className="w-full flex items-center justify-center py-3 px-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
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
                    className="block w-full py-3 px-4 bg-primary text-white text-center font-medium rounded-lg hover:bg-primary/90 transition-colors"
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
