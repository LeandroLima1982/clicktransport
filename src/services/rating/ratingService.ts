
import { supabase } from '@/integrations/supabase/client';
import { RatingData, RatingStats } from '@/types/rating';
import { toast } from 'sonner';
import { logInfo } from '../monitoring/systemLogService';

export const submitRating = async (ratingData: RatingData): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .insert(ratingData)
      .select('id')
      .single();
      
    if (error) throw error;
    
    logInfo(
      `Rating submitted for driver: ${ratingData.driver_id}`,
      'rating',
      { driver_id: ratingData.driver_id, order_id: ratingData.order_id, rating: ratingData.rating }
    );
    
    return true;
  } catch (error) {
    console.error('Error submitting rating:', error);
    toast.error('Erro ao enviar avaliação');
    return false;
  }
};

export const getDriverRatings = async (driverId: string): Promise<RatingData[]> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching driver ratings:', error);
    return [];
  }
};

export const getDriverRatingStats = async (driverId: string): Promise<RatingStats | null> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('rating')
      .eq('driver_id', driverId);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
      };
    }
    
    const ratings = data.map(item => item.rating);
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = parseFloat((sumRatings / totalRatings).toFixed(1));
    
    // Count by rating
    const fiveStarCount = ratings.filter(r => r === 5).length;
    const fourStarCount = ratings.filter(r => r === 4).length;
    const threeStarCount = ratings.filter(r => r === 3).length;
    const twoStarCount = ratings.filter(r => r === 2).length;
    const oneStarCount = ratings.filter(r => r === 1).length;
    
    return {
      averageRating,
      totalRatings,
      fiveStarCount,
      fourStarCount,
      threeStarCount,
      twoStarCount,
      oneStarCount
    };
  } catch (error) {
    console.error('Error fetching driver rating stats:', error);
    return null;
  }
};

export const getServiceOrderRating = async (orderId: string): Promise<RatingData | null> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('*')
      .eq('order_id', orderId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rating found
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching order rating:', error);
    return null;
  }
};
