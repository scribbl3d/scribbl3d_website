import type { Review } from "@/types/review";

export function calculateRatings(reviews: Review[]) {
  if (reviews.length === 0) {
    return {
      average: 0,
      distribution: [
        { rating: 5, percentage: 0 },
        { rating: 4, percentage: 0 },
        { rating: 3, percentage: 0 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 0 },
      ],
    };
  }

  // Calculate average rating
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = Number((sum / reviews.length).toFixed(1));

  // Calculate distribution
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    counts[review.rating as keyof typeof counts]++;
  });

  const distribution = Object.entries(counts)
    .reverse()
    .map(([rating, count]) => ({
      rating: Number(rating),
      percentage: Math.round((count / reviews.length) * 100),
    }));

  return { average, distribution };
}
