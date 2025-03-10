
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransitionEffectProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
}

const TransitionEffect: React.FC<TransitionEffectProps> = ({ 
  children, 
  delay = 0,
  direction = 'up',
  duration = 500
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

  // Different transition styles based on direction
  const getTransitionStyles = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return 'opacity-0 translate-y-8';
        case 'down':
          return 'opacity-0 -translate-y-8';
        case 'left':
          return 'opacity-0 translate-x-8';
        case 'right':
          return 'opacity-0 -translate-x-8';
        case 'scale':
          return 'opacity-0 scale-95';
        case 'fade':
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-y-0 translate-x-0 scale-100';
  };

  // Mobile specific animations
  const getMobileClass = () => {
    if (!isMobile) return '';
    return isVisible ? 'animate-app-reveal' : '';
  };

  return (
    <div
      className={`transition-all ease-out w-full max-w-none ${getTransitionStyles()} ${getMobileClass()}`}
      style={{ 
        transitionDuration: `${duration}ms`, 
        transitionDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

export default TransitionEffect;
