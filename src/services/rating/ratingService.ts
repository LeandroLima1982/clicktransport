
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RatingData {
  order_id: string;
  driver_id: string;
  rating: number;
  feedback?: string;
}

interface DriverRatingStats {
  averageRating: number;
  totalRatings: number;
  starCounts: Record<number, number>;
}

export const submitRating = async (data: RatingData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('driver_ratings')
      .insert([data]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error submitting rating:', error);
    toast.error('Erro ao enviar avaliação');
    return false;
  }
};

export const getDriverRatingStats = async (driverId: string): Promise<DriverRatingStats | null> => {
  try {
    if (!driverId) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('rating')
      .eq('driver_id', driverId);
    
    if (error) {
      console.error('Error fetching driver ratings:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    // Calculate average rating
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / data.length;
    
    // Count ratings by star
    const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(item => {
      if (item.rating >= 1 && item.rating <= 5) {
        starCounts[item.rating]++;
      }
    });
    
    return {
      averageRating: parseFloat(average.toFixed(1)),
      totalRatings: data.length,
      starCounts
    };
  } catch (error) {
    console.error('Error calculating driver stats:', error);
    return null;
  }
};
