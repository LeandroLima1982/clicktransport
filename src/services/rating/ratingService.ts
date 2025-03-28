
import { supabase } from '@/integrations/supabase/client';
import { logError, logInfo } from '../monitoring/systemLogService';
import { RatingData } from '@/types/rating';

export const submitRating = async (ratingData: RatingData): Promise<boolean> => {
  try {
    // Validate the rating data
    if (!ratingData.order_id || !ratingData.driver_id || !ratingData.rating) {
      logError('Invalid rating data', 'driver', {
        error: 'Missing required fields',
        data: ratingData
      });
      return false;
    }
    
    // Insert the rating into the driver_ratings table
    const { error } = await supabase
      .from('driver_ratings')
      .insert({
        order_id: ratingData.order_id,
        driver_id: ratingData.driver_id,
        rating: ratingData.rating,
        feedback: ratingData.feedback,
        customer_id: ratingData.customer_id
      });
    
    if (error) {
      logError('Error submitting rating', 'driver', {
        error: error.message,
        data: ratingData
      });
      return false;
    }
    
    logInfo('Rating submitted successfully', 'driver', {
      driver_id: ratingData.driver_id,
      order_id: ratingData.order_id,
      rating: ratingData.rating
    });
    
    return true;
  } catch (error) {
    logError('Exception in submitRating', 'driver', { error });
    return false;
  }
};

export const getDriverRatings = async (driverId: string) => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
    
    if (error) {
      logError('Error fetching driver ratings', 'driver', {
        error: error.message,
        driver_id: driverId
      });
      return { ratings: [], error };
    }
    
    return { ratings: data || [], error: null };
  } catch (error) {
    logError('Exception in getDriverRatings', 'driver', { 
      error,
      driver_id: driverId
    });
    return { ratings: [], error };
  }
};

export const getDriverAverageRating = async (driverId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('rating')
      .eq('driver_id', driverId);
    
    if (error) {
      logError('Error fetching driver ratings for average', 'driver', {
        error: error.message,
        driver_id: driverId
      });
      return 0;
    }
    
    if (!data || data.length === 0) {
      return 0;
    }
    
    // Calculate average rating
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / data.length;
  } catch (error) {
    logError('Exception in getDriverAverageRating', 'driver', { 
      error,
      driver_id: driverId
    });
    return 0;
  }
};
