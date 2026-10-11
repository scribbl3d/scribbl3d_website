/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/reviews/route';
import { PATCH } from '@/app/api/admin/reviews/moderate/route';
import { isAdminRequest } from '@/lib/admin-session';
import { listReviewsForModeration, moderateReview } from '@/lib/reviews/moderation';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/reviews/moderation', () => ({
  listReviewsForModeration: jest.fn(),
  moderateReview: jest.fn(),
  getModerationStatusCounts: jest.fn().mockResolvedValue({ pending: 1, approved: 2, hidden: 0, all: 3, lowRatingPending: 1 }),
}));

const getReq = (query = '') => ({ nextUrl: new URL(`http://x/api/admin/reviews${query}`) }) as unknown as NextRequest;
const patchReq = (body: unknown) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;

beforeEach(() => {
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(true);
  jest.mocked(listReviewsForModeration).mockReset().mockResolvedValue({ reviews: [], total: 0, page: 1, pageSize: 20 });
  jest.mocked(moderateReview).mockReset().mockResolvedValue({ id: 'p1', status: 'APPROVED', moderatedAt: new Date() } as any);
});

describe('GET /api/admin/reviews', () => {
  it('requires an admin', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(false);
    expect((await GET(getReq())).status).toBe(401);
    expect(listReviewsForModeration).not.toHaveBeenCalled();
  });

  it('defaults to pending reviews of all kinds and ratings, with status counts', async () => {
    const res = await GET(getReq());
    expect((await res.json()).counts).toEqual({ pending: 1, approved: 2, hidden: 0, all: 3, lowRatingPending: 1 });
    expect(listReviewsForModeration).toHaveBeenCalledWith({ status: 'PENDING', kind: 'all', rating: 'all', page: 1 });
  });

  it('parses filters', async () => {
    await GET(getReq('?status=HIDDEN&kind=product&rating=2&page=3'));
    expect(listReviewsForModeration).toHaveBeenCalledWith({ status: 'HIDDEN', kind: 'product', rating: 2, page: 3 });
    await GET(getReq('?rating=low'));
    expect(jest.mocked(listReviewsForModeration).mock.calls[1][0]).toEqual(expect.objectContaining({ rating: 'low' }));
  });

  it.each(['?status=DELETED', '?kind=user', '?rating=9', '?page=0'])('rejects %s', async (query) => {
    expect((await GET(getReq(query))).status).toBe(400);
  });
});

describe('PATCH /api/admin/reviews/moderate', () => {
  it('requires an admin', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(false);
    expect((await PATCH(patchReq({ kind: 'product', id: 'p1', action: 'approve' }))).status).toBe(401);
    expect(moderateReview).not.toHaveBeenCalled();
  });

  it('approves or hides', async () => {
    expect((await PATCH(patchReq({ kind: 'product', id: 'p1', action: 'approve' }))).status).toBe(200);
    expect(moderateReview).toHaveBeenCalledWith('product', 'p1', 'approve');
  });

  it.each([
    { kind: 'product', id: 'p1', action: 'delete' },
    { kind: 'product', id: 'p1', action: 'edit', content: 'new text' },
    { kind: 'user', id: 'p1', action: 'hide' },
    { kind: 'order', id: '../x', action: 'hide' },
  ])('rejects unsupported actions or input %#', async (body) => {
    expect((await PATCH(patchReq(body))).status).toBe(400);
    expect(moderateReview).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing review', async () => {
    jest.mocked(moderateReview).mockResolvedValue(null);
    expect((await PATCH(patchReq({ kind: 'order', id: 'gone', action: 'hide' }))).status).toBe(404);
  });
});
