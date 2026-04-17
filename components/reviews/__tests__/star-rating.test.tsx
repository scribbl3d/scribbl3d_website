import { render, screen } from '@testing-library/react';
import { StarRating } from '../star-rating';

describe('StarRating', () => {
  it('should render 5 stars', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('should fill stars up to rating', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('svg');
    
    stars.forEach((star, index) => {
      const classes = star.getAttribute('class') || '';
      if (index < 3) {
        expect(classes).toContain('fill-yellow-400');
        expect(classes).toContain('text-yellow-400');
      } else {
        expect(classes).toContain('fill-gray-200');
        expect(classes).toContain('text-gray-200');
      }
    });
  });

  it('should render all filled stars for rating 5', () => {
    const { container } = render(<StarRating rating={5} />);
    const yellowStars = container.querySelectorAll('.fill-yellow-400');
    expect(yellowStars.length).toBe(5);
  });

  it('should render all empty stars for rating 0', () => {
    const { container } = render(<StarRating rating={0} />);
    const grayStars = container.querySelectorAll('.fill-gray-200');
    expect(grayStars.length).toBe(5);
  });

  it('should apply small size class when size is sm', () => {
    const { container } = render(<StarRating rating={3} size="sm" />);
    const stars = container.querySelectorAll('svg');
    stars.forEach(star => {
      const classes = star.getAttribute('class') || '';
      expect(classes).toContain('w-4');
      expect(classes).toContain('h-4');
    });
  });

  it('should apply medium size class when size is md', () => {
    const { container } = render(<StarRating rating={3} size="md" />);
    const stars = container.querySelectorAll('svg');
    stars.forEach(star => {
      const classes = star.getAttribute('class') || '';
      expect(classes).toContain('w-5');
      expect(classes).toContain('h-5');
    });
  });

  it('should default to medium size', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('svg');
    stars.forEach(star => {
      const classes = star.getAttribute('class') || '';
      expect(classes).toContain('w-5');
      expect(classes).toContain('h-5');
    });
  });

  it('should handle fractional ratings by rounding down', () => {
    const { container } = render(<StarRating rating={3.7} />);
    const yellowStars = container.querySelectorAll('.fill-yellow-400');
    expect(yellowStars.length).toBe(3);
  });

  it('should handle rating of 1', () => {
    const { container } = render(<StarRating rating={1} />);
    const yellowStars = container.querySelectorAll('.fill-yellow-400');
    const grayStars = container.querySelectorAll('.fill-gray-200');
    expect(yellowStars.length).toBe(1);
    expect(grayStars.length).toBe(4);
  });

  it('should handle rating of 4', () => {
    const { container } = render(<StarRating rating={4} />);
    const yellowStars = container.querySelectorAll('.fill-yellow-400');
    const grayStars = container.querySelectorAll('.fill-gray-200');
    expect(yellowStars.length).toBe(4);
    expect(grayStars.length).toBe(1);
  });
});
