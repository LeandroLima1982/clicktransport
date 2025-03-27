
import React, { useEffect } from 'react';

const TransitionEffect: React.FC = () => {
  useEffect(() => {
    // Intersection Observer to detect when elements come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Add the 'visible' class when the element is in view
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      root: null, // viewport
      threshold: 0.1, // trigger when 10% of the item is visible
      rootMargin: '0px 0px -50px 0px' // negative bottom margin to trigger earlier
    });
    
    // Observe all stagger items
    document.querySelectorAll('.stagger-item').forEach(item => {
      observer.observe(item);
    });
    
    return () => {
      // Cleanup
      document.querySelectorAll('.stagger-item').forEach(item => {
        observer.unobserve(item);
      });
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default TransitionEffect;
