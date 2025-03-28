
import { supabase } from '@/integrations/supabase/client';
import { logError, logInfo } from '@/services/monitoring/systemLogService';
import { RatingData, RatingStats } from '@/types/rating';

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

// New function to get driver rating statistics
export const getDriverRatingStats = async (driverId: string): Promise<RatingStats> => {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('rating')
      .eq('driver_id', driverId);
    
    if (error) {
      logError('Error fetching driver rating stats', 'driver', {
        error: error.message,
        driver_id: driverId
      });
      
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
    
    // Count ratings by star
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    // Calculate average and count by star
    const sum = data.reduce((acc, curr) => {
      // Increment the count for this rating
      ratingCounts[curr.rating as keyof typeof ratingCounts] += 1;
      return acc + curr.rating;
    }, 0);
    
    return {
      averageRating: sum / data.length,
      totalRatings: data.length,
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1]
    };
  } catch (error) {
    logError('Exception in getDriverRatingStats', 'driver', { 
      error,
      driver_id: driverId
    });
    
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
};
