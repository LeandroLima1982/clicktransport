
import React, { useEffect, useState } from 'react';
import { getDriverRatingStats, DriverRatingStats } from '@/services/rating/ratingService';
import { RatingStats } from '@/types/rating';
import RatingDisplay from './RatingDisplay';
import { Skeleton } from '@/components/ui/skeleton';

interface RatingStatsProps {
  driverId: string | null;
  className?: string;
}

const DriverRatingStats: React.FC<RatingStatsProps> = ({ driverId, className }) => {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!driverId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const ratingStats = await getDriverRatingStats(driverId);
        
        if (ratingStats) {
          // Convert DriverRatingStats to RatingStats format
          const convertedStats: RatingStats = {
            averageRating: ratingStats.averageRating,
            totalRatings: ratingStats.totalRatings,
            fiveStarCount: ratingStats.starCounts[5] || 0,
            fourStarCount: ratingStats.starCounts[4] || 0,
            threeStarCount: ratingStats.starCounts[3] || 0,
            twoStarCount: ratingStats.starCounts[2] || 0,
            oneStarCount: ratingStats.starCounts[1] || 0
          };
          setStats(convertedStats);
        }
      } catch (error) {
        console.error('Error fetching rating stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [driverId]);

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return <RatingDisplay stats={stats || { 
    averageRating: 0, 
    totalRatings: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  }} className={className} />;
};

export default DriverRatingStats;
