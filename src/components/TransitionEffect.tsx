
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransitionEffectProps {
  children: React.ReactNode;
  delay?: number;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ 
  children, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [delay]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
