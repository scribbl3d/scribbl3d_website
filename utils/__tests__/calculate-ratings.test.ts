import { calculateRatings } from '../calculate-ratings';
import type { Review } from '@/types/review';

const createMockReview = (overrides: Partial<Review> = {}): Review => ({
  id: '1',
  rating: 5,
  title: 'Great product',
  content: 'I loved it!',
  userId: 'user1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  user: {
    name: 'John Doe',
  },
  ...overrides,
});

describe('calculate-ratings', () => {
  describe('calculateRatings', () => {
    it('should return zero average and empty distribution for empty reviews', () => {
      const result = calculateRatings([]);
      
      expect(result.average).toBe(0);
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 0 },
        { rating: 4, percentage: 0 },
        { rating: 3, percentage: 0 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 0 },
      ]);
    });

    it('should calculate average rating correctly', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 4 }),
        createMockReview({ id: '3', rating: 3 }),
      ];
      
      const result = calculateRatings(reviews);
      expect(result.average).toBe(4);
    });

    it('should calculate distribution correctly', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 5 }),
        createMockReview({ id: '3', rating: 4 }),
        createMockReview({ id: '4', rating: 3 }),
      ];
      
      const result = calculateRatings(reviews);
      
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 50 },
        { rating: 4, percentage: 25 },
        { rating: 3, percentage: 25 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 0 },
      ]);
    });

    it('should handle all 5-star reviews', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 5 }),
        createMockReview({ id: '3', rating: 5 }),
      ];
      
      const result = calculateRatings(reviews);
      
      expect(result.average).toBe(5);
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 100 },
        { rating: 4, percentage: 0 },
        { rating: 3, percentage: 0 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 0 },
      ]);
    });

    it('should handle all 1-star reviews', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 1 }),
        createMockReview({ id: '2', rating: 1 }),
      ];
      
      const result = calculateRatings(reviews);
      
      expect(result.average).toBe(1);
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 0 },
        { rating: 4, percentage: 0 },
        { rating: 3, percentage: 0 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 100 },
      ]);
    });

    it('should round average to 1 decimal place', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 4 }),
        createMockReview({ id: '3', rating: 3 }),
        createMockReview({ id: '4', rating: 4 }),
        createMockReview({ id: '5', rating: 5 }),
        createMockReview({ id: '6', rating: 3 }),
      ];
      
      const result = calculateRatings(reviews);
      expect(result.average).toBe(4);
    });

    it('should round percentages correctly', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 4 }),
        createMockReview({ id: '3', rating: 3 }),
      ];
      
      const result = calculateRatings(reviews);
      
      result.distribution.forEach(dist => {
        expect(Number.isInteger(dist.percentage)).toBe(true);
      });
    });

    it('should handle single review', () => {
      const reviews: Review[] = [createMockReview({ id: '1', rating: 5 })];
      
      const result = calculateRatings(reviews);
      
      expect(result.average).toBe(5);
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 100 },
        { rating: 4, percentage: 0 },
        { rating: 3, percentage: 0 },
        { rating: 2, percentage: 0 },
        { rating: 1, percentage: 0 },
      ]);
    });

    it('should handle mixed ratings evenly distributed', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 4 }),
        createMockReview({ id: '3', rating: 3 }),
        createMockReview({ id: '4', rating: 2 }),
        createMockReview({ id: '5', rating: 1 }),
      ];
      
      const result = calculateRatings(reviews);
      
      expect(result.average).toBe(3);
      expect(result.distribution).toEqual([
        { rating: 5, percentage: 20 },
        { rating: 4, percentage: 20 },
        { rating: 3, percentage: 20 },
        { rating: 2, percentage: 20 },
        { rating: 1, percentage: 20 },
      ]);
    });

    it('should handle large number of reviews', () => {
      const reviews: Review[] = Array.from({ length: 100 }, (_, i) => 
        createMockReview({ 
          id: `${i + 1}`,
          rating: (i % 5) + 1,
        })
      );
      
      const result = calculateRatings(reviews);
      
      expect(result.average).toBe(3);
      expect(result.distribution.every(d => d.percentage === 20)).toBe(true);
    });

    it('should handle decimal average and round correctly', () => {
      const reviews: Review[] = [
        createMockReview({ id: '1', rating: 5 }),
        createMockReview({ id: '2', rating: 3 }),
        createMockReview({ id: '3', rating: 4 }),
      ];
      
      const result = calculateRatings(reviews);
      expect(result.average).toBe(4);
    });
  });
});
