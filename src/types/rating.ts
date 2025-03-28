
export interface RatingData {
  id?: string;
  order_id: string;
  driver_id: string;
  customer_id?: string;
  rating: number;
  feedback?: string;
  created_at?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}
