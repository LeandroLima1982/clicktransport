
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useDriverId = (user: User | null) => {
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchDriverId = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching driver ID:', error);
        return;
      }

      if (data) {
        setDriverId(data.id);
      }
    };

    fetchDriverId();
  }, [user]);

  return driverId;
};
