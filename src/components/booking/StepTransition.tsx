
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepTransitionProps {
  children: React.ReactNode;
  step: number;
  direction: number;
}

const StepTransition: React.FC<StepTransitionProps> = ({ children, step, direction }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ 
          x: direction > 0 ? 20 : -20, 
          opacity: 0 
        }}
        animate={{ 
          x: 0, 
          opacity: 1 
        }}
        exit={{ 
          x: direction < 0 ? 20 : -20, 
          opacity: 0 
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default StepTransition;
