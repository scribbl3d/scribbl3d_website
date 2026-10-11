/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/product-reviews/route';
import { getProductReviewPage, getProductReviewSummary } from '@/lib/reviews/productReviews';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/reviews/productReviews', () => ({ getProductReviewSummary: jest.fn(), getProductReviewPage: jest.fn() }));

const req = (query: string) => ({ nextUrl: new URL(`http://x/api/product-reviews${query}`) }) as unknown as NextRequest;
const summary = (count: number) => ({ count, average: null, breakdown: null, showList: count >= 2, showAverage: count >= 5 });

beforeEach(() => {
  jest.mocked(getProductReviewSummary).mockReset().mockResolvedValue(summary(7));
  jest.mocked(getProductReviewPage).mockReset().mockResolvedValue([{ id: 'r6' }] as any);
});

describe('GET /api/product-reviews', () => {
  it.each(['', '?type=shoe&id=a', '?type=printer', '?type=printer&id=../x', '?type=printer&id=a&page=0'])('rejects %s', async (q) => {
    expect((await GET(req(q))).status).toBe(400);
  });

  it('returns the requested page', async () => {
    const res = await GET(req('?type=filament&id=red&page=2'));
    expect(await res.json()).toEqual({ reviews: [{ id: 'r6' }], total: 7 });
    expect(getProductReviewPage).toHaveBeenCalledWith('filament', 'red', 2);
  });

  it('returns nothing below the display threshold', async () => {
    jest.mocked(getProductReviewSummary).mockResolvedValue(summary(1));
    const res = await GET(req('?type=printer&id=p1'));
    expect(await res.json()).toEqual({ reviews: [], total: 0 });
    expect(getProductReviewPage).not.toHaveBeenCalled();
  });
});
