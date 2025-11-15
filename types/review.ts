export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}

export interface RatingDistribution {
  rating: number;
  percentage: number;
}
