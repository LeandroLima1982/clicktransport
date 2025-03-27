
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SectionConfig {
  id: string;
  name: string;
  sort_order: number;
  visible: boolean;
  componentPath: string;
}

// Interface representing the actual database schema
interface SectionOrderRow {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  visible: boolean;
  componentpath: string; // Note the lowercase 'p' matching the database column
  created_at: string;
  updated_at: string;
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
          .order('sort_order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Map database rows to our SectionConfig interface
          const mappedData = (data as SectionOrderRow[]).map(row => ({
            id: row.id,
            name: row.name,
            sort_order: row.sort_order,
            visible: row.visible,
            componentPath: row.componentpath // Map from 'componentpath' to 'componentPath'
          }));
          
          setSectionsConfig(mappedData);
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
