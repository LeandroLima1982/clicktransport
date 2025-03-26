
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Car, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoggedOutTabItemsProps {
  onClose: () => void;
}

const LoggedOutTabItems: React.FC<LoggedOutTabItemsProps> = ({ onClose }) => {
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');

  useEffect(() => {
    const fetchLogoUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoUrl();

    // Subscribe to logo changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_images',
          filter: 'section_id=eq.logo'
        },
        (payload) => {
          if (payload.new && payload.new.image_url) {
            setLogoUrl(payload.new.image_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="tab-bar">
      <Link to="/" className="tab-item" onClick={onClose}>
        <Home className="h-5 w-5 mb-1" />
        <span className="text-xs">Início</span>
      </Link>
      <a href="#request-service" className="tab-item" onClick={onClose}>
        <Car className="h-5 w-5 mb-1" />
        <span className="text-xs">Solicitar</span>
      </a>
      <Link to="/auth?type=client" className="tab-item" onClick={onClose}>
        <User className="h-5 w-5 mb-1" />
        <span className="text-xs">Login</span>
      </Link>
      <Link to="/auth?register=true" className="tab-item" onClick={onClose}>
        <LogOut className="h-5 w-5 mb-1" />
        <span className="text-xs">Cadastro</span>
      </Link>
    </div>
  );
};

export default LoggedOutTabItems;
