import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductReviews, RatingSummaryInline } from '@/components/reviews/ProductReviews';

const summary = (count: number, average: number | null = null) => ({
  count,
  average: count >= 3 ? average : null,
  breakdown: count >= 3 ? { 1: 0, 2: 1, 3: 0, 4: 2, 5: count - 3 } : null,
  showList: count >= 2,
  showAverage: count >= 3,
});

const review = (i: number, overrides: Record<string, unknown> = {}) => ({
  id: `r${i}`, reviewerName: `Buyer ${i}`, rating: 4, content: `Review text ${i}`, tags: ['Smooth extrusion'],
  variantLabel: 'Red · 1kg', isIncentivised: false, createdAt: '2026-10-05T10:00:00.000Z', ...overrides,
});

beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn();
});

describe('ProductReviews', () => {
  it('renders nothing with fewer than 2 approved reviews', () => {
    const { container } = render(<ProductReviews family="printer" productId="p1" summary={summary(1)} initialReviews={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('colours rating chips green, indigo, amber or red', () => {
    render(<ProductReviews family="printer" productId="p1" summary={summary(4)} initialReviews={[review(1, { rating: 5 }), review(4, { rating: 4 }), review(2, { rating: 3 }), review(3, { rating: 1 })]} />);
    expect(screen.getByRole('img', { name: '5 out of 5 stars' }).className).toContain('bg-emerald-600');
    expect(screen.getByRole('img', { name: '4 out of 5 stars' }).className).toContain('bg-[#4f46e5]');
    expect(screen.getByRole('img', { name: '3 out of 5 stars' }).className).toContain('bg-amber-500');
    expect(screen.getByRole('img', { name: '1 out of 5 stars' }).className).toContain('bg-red-500');
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('shows the list without an average for 2 reviews', () => {
    render(<ProductReviews family="printer" productId="p1" summary={summary(2)} initialReviews={[review(1), review(2)]} />);
    expect(screen.getByRole('heading', { name: 'Customer reviews' })).toBeInTheDocument();
    expect(screen.getByText('2 verified buyers')).toBeInTheDocument();
    expect(screen.queryByText(/Based on/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Verified purchase')).toHaveLength(2);
    expect(screen.getAllByText('Bought: Red · 1kg')).toHaveLength(2);
    expect(screen.getByText('Review text 1')).toBeInTheDocument();
  });

  it('shows the average, count and breakdown from 3 reviews', () => {
    render(<ProductReviews family="printer" productId="p1" summary={summary(6, 4.3)} initialReviews={[1, 2, 3, 4, 5].map((i) => review(i))} />);
    expect(screen.getAllByRole('img', { name: '4.3 out of 5 stars' }).length).toBeGreaterThan(0);
    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('Based on 6 reviews')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 5-star reviews' })).toBeInTheDocument();
    expect(screen.getByText('3 (50%)')).toBeInTheDocument();
  });

  it('does not show an incentivised label on the product page', () => {
    render(<ProductReviews family="printer" productId="p1" summary={summary(2)} initialReviews={[review(1, { isIncentivised: true }), review(2)]} />);
    expect(screen.queryByText(/Incentivised/)).not.toBeInTheDocument();
  });

  it('loads more reviews', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ reviews: [review(6), review(5)] }) });
    render(<ProductReviews family="filament" productId="red" summary={summary(6, 4)} initialReviews={[1, 2, 3, 4, 5].map((i) => review(i))} />);
    fireEvent.click(screen.getByRole('button', { name: 'Load more reviews' }));
    expect(await screen.findByText('Review text 6')).toBeInTheDocument();
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/product-reviews?type=filament&id=red&page=2');
    expect(screen.getAllByText('Review text 5')).toHaveLength(1); // no duplicates
    expect(screen.queryByRole('button', { name: 'Load more reviews' })).not.toBeInTheDocument();
  });

  it('hides Load more when everything is shown', () => {
    render(<ProductReviews family="printer" productId="p1" summary={summary(3)} initialReviews={[1, 2, 3].map((i) => review(i))} />);
    expect(screen.queryByRole('button', { name: 'Load more reviews' })).not.toBeInTheDocument();
  });

  it('shows an error when loading more fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    render(<ProductReviews family="printer" productId="p1" summary={summary(6, 4)} initialReviews={[1, 2, 3, 4, 5].map((i) => review(i))} />);
    fireEvent.click(screen.getByRole('button', { name: 'Load more reviews' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not load more reviews'));
  });
});

describe('RatingSummaryInline', () => {
  it('appears only from 3 reviews and links to the section', () => {
    const { container, rerender } = render(<RatingSummaryInline summary={summary(2)} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<RatingSummaryInline summary={summary(12, 4.6)} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#reviews');
    expect(screen.getByRole('img', { name: '4.6 out of 5 stars' })).toBeInTheDocument();
    expect(screen.getByText('12 ratings')).toBeInTheDocument();
  });
});
