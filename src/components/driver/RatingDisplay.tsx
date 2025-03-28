
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Progress } from '@/components/ui/progress';
import { RatingStats } from '@/types/rating';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  stats: RatingStats;
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ stats, className }) => {
  if (!stats || stats.totalRatings === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-muted-foreground mb-2">Você ainda não possui avaliações</p>
            <p className="text-sm text-muted-foreground">
              As avaliações dos passageiros aparecerão aqui após a conclusão das viagens.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPercentage = (count: number) => {
    return Math.round((count / stats.totalRatings) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Avaliações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-primary">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating readOnly initialRating={stats.averageRating} className="mb-1" />
            <div className="text-sm text-muted-foreground">
              {stats.totalRatings} {stats.totalRatings === 1 ? 'avaliação' : 'avaliações'}
            </div>
          </div>

          <div className="w-full space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = {
                5: stats.fiveStarCount,
                4: stats.fourStarCount,
                3: stats.threeStarCount,
                2: stats.twoStarCount,
                1: stats.oneStarCount
              }[star];
              
              const percentage = getPercentage(count);
              
              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center w-8">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="h-3 w-3 text-yellow-400 ml-1" />
                  </div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <div className="text-xs text-muted-foreground w-10 text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingDisplay;
