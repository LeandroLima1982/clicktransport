import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SectionConfig {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  componentPath: string;
}

interface SectionControllerProps {
  children: React.ReactNode;
  defaultSections?: Record<string, React.ReactNode>;
}

const SectionController: React.FC<SectionControllerProps> = ({ 
  children,
  defaultSections = {}
}) => {
  const [sectionsConfig, setSectionsConfig] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('section_order')
          .select('*')
          .order('order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setSectionsConfig(data);
        }
      } catch (error) {
        console.error('Error loading section order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionOrder();
  }, []);

  // If we're still loading or no config found, render children as is
  if (loading || sectionsConfig.length === 0) {
    return <>{children}</>;
  }

  // Helper function to get child by ID
  const getChildById = (id: string): React.ReactNode => {
    // First check in the defaultSections prop
    if (defaultSections[id]) {
      return defaultSections[id];
    }
    
    // Otherwise try to find in children
    if (!React.Children.count(children)) return null;
    
    let foundChild: React.ReactNode = null;
    
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.id === id) {
        foundChild = child;
      }
    });
    
    return foundChild;
  };

  // Reorganize and filter sections based on config
  const organizedSections = sectionsConfig
    .filter(section => section.visible)
    .map(section => ({
      ...section,
      component: getChildById(section.id)
    }))
    .filter(section => section.component !== null);

  return (
    <>
      {organizedSections.map(section => (
        <React.Fragment key={section.id}>
          {section.component}
        </React.Fragment>
      ))}
    </>
  );
};

export default SectionController;
