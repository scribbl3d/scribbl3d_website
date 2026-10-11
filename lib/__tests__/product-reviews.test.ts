/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { buildProductJsonLd } from '@/lib/metadata';
import {
  getPdpReviews,
  pdpJsonLdRating,
  reviewScope,
  reviewsJsonLd,
  summarize,
} from '@/lib/reviews/productReviews';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    filament: { findUnique: jest.fn() },
    filamentColorGroup: { findMany: jest.fn() },
    productReview: { groupBy: jest.fn(), findMany: jest.fn() },
  },
}));

const m = prisma as unknown as Record<string, Record<string, jest.Mock>>;

beforeEach(() => {
  Object.values(m).forEach((model) => Object.values(model).forEach((fn) => fn.mockReset()));
});

describe('summarize thresholds (P4)', () => {
  it('hides everything below 2 reviews', () => {
    expect(summarize([{ rating: 5, count: 1 }])).toEqual({ count: 1, average: null, breakdown: null, showList: false, showAverage: false });
  });

  it('shows the list but no average for 2–4 reviews', () => {
    const s = summarize([{ rating: 5, count: 2 }, { rating: 1, count: 2 }]);
    expect(s).toEqual(expect.objectContaining({ count: 4, showList: true, showAverage: false, average: null, breakdown: null }));
  });

  it('shows the average and breakdown from 5 reviews', () => {
    const s = summarize([{ rating: 5, count: 3 }, { rating: 4, count: 1 }, { rating: 2, count: 2 }]);
    expect(s.showAverage).toBe(true);
    expect(s.average).toBe(3.8); // (15 + 4 + 4) / 6 = 3.83
    expect(s.breakdown).toEqual({ 1: 0, 2: 2, 3: 0, 4: 1, 5: 3 });
  });
});

describe('reviewScope (P2, P3)', () => {
  it('only counts approved reviews for the product', async () => {
    expect(await reviewScope('printer', 'p1')).toEqual({ status: 'APPROVED', printerId: 'p1' });
    expect(await reviewScope('prebuilt', 'b1')).toEqual({ status: 'APPROVED', prebuiltProductId: 'b1' });
    expect(await reviewScope('resin', 'r1')).toEqual({ status: 'APPROVED', resinId: 'r1' });
  });

  it('pools filament reviews across the colour group', async () => {
    m.filament.findUnique.mockResolvedValue({ material: 'PETG', finishType: 'Glossy' });
    m.filamentColorGroup.findMany.mockResolvedValue([{ filamentId: 'red' }, { filamentId: 'blue' }, { filamentId: 'white' }]);
    expect(await reviewScope('filament', 'red')).toEqual({ status: 'APPROVED', filamentId: { in: ['red', 'blue', 'white'] } });
    expect(m.filamentColorGroup.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { category: 'PETG Glossy' } }));
  });

  it('falls back to the single filament when it has no group', async () => {
    m.filament.findUnique.mockResolvedValue(null);
    expect(await reviewScope('filament', 'solo')).toEqual({ status: 'APPROVED', filamentId: { in: ['solo'] } });
  });
});

describe('getPdpReviews', () => {
  it('does not load reviews when the section is hidden', async () => {
    m.productReview.groupBy.mockResolvedValue([{ rating: 4, _count: { _all: 1 } }]);
    const result = await getPdpReviews('printer', 'p1');
    expect(result.reviews).toEqual([]);
    expect(m.productReview.findMany).not.toHaveBeenCalled();
  });

  it('loads the first page newest first without private fields', async () => {
    m.productReview.groupBy.mockResolvedValue([{ rating: 4, _count: { _all: 3 } }]);
    m.productReview.findMany.mockResolvedValue([
      { id: 'r1', reviewerName: 'Asha Rao', rating: 4, content: 'Good', tags: [], variantLabel: null, isIncentivised: false, createdAt: new Date('2026-10-05T10:00:00Z') },
    ]);
    const result = await getPdpReviews('printer', 'p1');
    expect(result.reviews[0].createdAt).toBe('2026-10-05T10:00:00.000Z');
    const args = m.productReview.findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.take).toBe(5);
    expect(Object.keys(args.select)).not.toEqual(expect.arrayContaining(['userId', 'orderId']));
  });
});

describe('JSON-LD (S1)', () => {
  const review = { id: 'r1', reviewerName: 'Asha Rao', rating: 5, content: 'Great', tags: [], variantLabel: null, isIncentivised: false, createdAt: '2026-10-05T10:00:00.000Z' };
  const base = { name: 'Printer', url: 'https://x/p', offers: [{ price: 1000, inStock: true }], returnPolicy: 'printer' as const };

  it('maps reviews to schema.org Review', () => {
    expect(reviewsJsonLd([review])).toEqual([
      {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Asha Rao' },
        datePublished: '2026-10-05',
        reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5, worstRating: 1 },
        reviewBody: 'Great',
      },
    ]);
  });

  it('adds rating and reviews only once the average is shown', () => {
    const few = { summary: summarize([{ rating: 5, count: 4 }]), reviews: [review] };
    expect(pdpJsonLdRating(few)).toEqual({});
    expect(buildProductJsonLd({ ...base, ...pdpJsonLdRating(few) })).not.toHaveProperty('aggregateRating');

    const enough = { summary: summarize([{ rating: 5, count: 4 }, { rating: 4, count: 1 }]), reviews: [review] };
    const data: any = buildProductJsonLd({ ...base, ...pdpJsonLdRating(enough) });
    expect(data.aggregateRating).toMatchObject({ ratingValue: 4.8, reviewCount: 5 });
    expect(data.review).toHaveLength(1);
  });
});
