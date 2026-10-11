/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { POST } from '@/app/api/review-links/[token]/route';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { loadReviewLink } from '@/lib/reviews/reviewableItems';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    productReview: { createMany: jest.fn((args) => ({ op: 'products', args })) },
    orderReview: { create: jest.fn((args) => ({ op: 'order', args })) },
    $transaction: jest.fn(),
  },
}));
jest.mock('@/lib/rate-limit', () => ({ rateLimit: jest.fn() }));
jest.mock('@/lib/reviews/rewards', () => ({ rewardReviewSubmission: jest.fn().mockResolvedValue({ issued: true }) }));
jest.mock('@/lib/reviews/reviewableItems', () => ({
  ...jest.requireActual('@/lib/reviews/reviewableItems'),
  loadReviewLink: jest.fn(),
}));

const context = { params: Promise.resolve({ token: 'clorder123.sig' }) };
const request = (body: unknown) =>
  ({ headers: new Headers({ 'x-forwarded-for': '1.2.3.4' }), json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;

const item = (index: number, overrides: Record<string, unknown> = {}) => ({
  index,
  itemType: 'filament',
  productId: `fil_${index}`,
  name: 'PLA Silk Gold',
  image: null,
  variantLabel: 'Gold · 1.75mm - 1kg',
  quantity: 1,
  reviewed: false,
  ...overrides,
});

const open = (items = [item(0), item(1, { itemType: 'printer', productId: 'printer_1'})]) => ({
  state: 'open',
  orderId: 'clorder123',
  orderNumber: 'ORDER123',
  userId: 'user_1',
  reviewerName: 'Asha Rao',
  orderReviewed: false,
  items,
});

beforeEach(() => {
  jest.mocked(rateLimit).mockReset().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 });
  jest.mocked(loadReviewLink).mockReset().mockResolvedValue(open() as any);
  jest.mocked(prisma.productReview.createMany).mockClear();
  jest.mocked(prisma.orderReview.create).mockClear();
  jest.mocked(prisma.$transaction).mockReset().mockResolvedValue([]);
});

describe('POST /api/review-links/[token]', () => {
  it('rate limits by client', async () => {
    jest.mocked(rateLimit).mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: 0 });
    expect((await POST(request({}), context)).status).toBe(429);
    expect(loadReviewLink).not.toHaveBeenCalled();
  });

  it.each([
    ['invalid', 404],
    ['ineligible', 409],
    ['expired', 409],
    ['completed', 409],
  ])('refuses a %s link with %i', async (state, status) => {
    jest.mocked(loadReviewLink).mockResolvedValue({ state } as any);
    const res = await POST(request({ consent: true, reviews: [{ index: 0, rating: 5 }] }), context);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual(expect.objectContaining({ state }));
    expect(prisma.productReview.createMany).not.toHaveBeenCalled();
  });

  it.each([
    ['nothing rated', { consent: true, reviews: [] }],
    ['an empty body', {}],
    ['no consent', { reviews: [{ index: 0, rating: 5 }] }],
    ['consent false', { consent: false, reviews: [{ index: 0, rating: 5 }] }],
    ['an order rating of 0', { consent: true, order: { rating: 0 } }],
    ['an order tag that does not exist', { consent: true, order: { rating: 5, tags: ['Smooth extrusion'] } }],
    ['rating 0', { consent: true, reviews: [{ index: 0, rating: 0 }] }],
    ['rating 6', { consent: true, reviews: [{ index: 0, rating: 6 }] }],
    ['fractional rating', { consent: true, reviews: [{ index: 0, rating: 4.5 }] }],
    ['text over 2,000 characters', { consent: true, reviews: [{ index: 0, rating: 5, content: 'a'.repeat(2001) }] }],
    ['unknown item', { consent: true, reviews: [{ index: 7, rating: 5 }] }],
    ['the same item twice', { consent: true, reviews: [{ index: 0, rating: 5 }, { index: 0, rating: 4 }] }],
    ['a tag for another product type', { consent: true, reviews: [{ index: 0, rating: 5, tags: ['Easy setup'] }] }],
  ])('rejects %s', async (_label, body) => {
    expect((await POST(request(body), context)).status).toBe(400);
    expect(prisma.productReview.createMany).not.toHaveBeenCalled();
  });

  it.each([
    ['a positive order tag on a 1-star review', { consent: true, order: { rating: 1, tags: ['Fast delivery'] } }],
    ['a problem order tag on a 5-star review', { consent: true, order: { rating: 5, tags: ['Late delivery'] } }],
    ['a positive product tag on a 2-star review', { consent: true, reviews: [{ index: 0, rating: 2, tags: ['Smooth extrusion'] }] }],
  ])('rejects %s', async (_label, body) => {
    expect((await POST(request(body), context)).status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('accepts tags that match the rating band', async () => {
    const res = await POST(
      request({ consent: true, order: { rating: 1, tags: ['Late delivery'] }, reviews: [{ index: 0, rating: 3, tags: ['Some stringing'] }] }),
      context,
    );
    expect(res.status).toBe(201);
  });

  it('rejects an item that is already reviewed', async () => {
    jest.mocked(loadReviewLink).mockResolvedValue(open([item(0, { reviewed: true }), item(1)]) as any);
    expect((await POST(request({ consent: true, reviews: [{ index: 0, rating: 5 }] }), context)).status).toBe(409);
  });

  it('saves pending reviews with the right product field and returns remaining items', async () => {
    const res = await POST(
      request({ consent: true, reviews: [{ index: 0, rating: 4, content: '  Prints cleanly  ', tags: ['Smooth extrusion', 'Smooth extrusion'] }] }),
      context,
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ submitted: 1, orderReviewed: false, remaining: 1 });
    expect(prisma.orderReview.create).not.toHaveBeenCalled();
    expect(prisma.productReview.createMany).toHaveBeenCalledWith({
      data: [
        {
          orderId: 'clorder123',
          orderItemIndex: 0,
          userId: 'user_1',
          itemType: 'filament',
          filamentId: 'fil_0',
          variantLabel: 'Gold · 1.75mm - 1kg',
          rating: 4,
          content: 'Prints cleanly',
          tags: ['Smooth extrusion'],
          reviewerName: 'Asha Rao',
          consentedAt: expect.any(Date),
        },
      ],
    });
  });

  it('tries to issue the coupon after a successful save, not before', async () => {
    const { rewardReviewSubmission } = jest.requireMock('@/lib/reviews/rewards');
    rewardReviewSubmission.mockClear();
    await POST(request({ consent: true, reviews: [{ index: 0, rating: 5 }] }), context);
    expect(rewardReviewSubmission).toHaveBeenCalledWith('clorder123', 'Asha Rao');

    rewardReviewSubmission.mockClear();
    jest.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('db down'));
    await POST(request({ consent: true, reviews: [{ index: 0, rating: 5 }] }), context);
    expect(rewardReviewSubmission).not.toHaveBeenCalled();
  });

  it('saves an order-level review on its own', async () => {
    const res = await POST(request({ consent: true, order: { rating: 5, content: ' Packed well ', tags: ['Fast delivery'] } }), context);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ submitted: 0, orderReviewed: true, remaining: 2 });
    expect(prisma.orderReview.create).toHaveBeenCalledWith({
      data: { orderId: 'clorder123', userId: 'user_1', rating: 5, content: 'Packed well', tags: ['Fast delivery'], reviewerName: 'Asha Rao', consentedAt: expect.any(Date) },
    });
    expect(prisma.productReview.createMany).not.toHaveBeenCalled();
    expect(jest.mocked(prisma.$transaction).mock.calls[0][0]).toHaveLength(1);
  });

  it('saves order and product reviews in one transaction', async () => {
    await POST(request({ consent: true, order: { rating: 4 }, reviews: [{ index: 1, rating: 5 }] }), context);
    const ops = jest.mocked(prisma.$transaction).mock.calls[0][0] as unknown as { op: string }[];
    expect(ops.map((o) => o.op)).toEqual(['order', 'products']);
  });

  it('refuses a second order-level review', async () => {
    jest.mocked(loadReviewLink).mockResolvedValue({ ...open(), orderReviewed: true } as any);
    expect((await POST(request({ consent: true, order: { rating: 5 } }), context)).status).toBe(409);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('treats a concurrent duplicate submission as already reviewed', async () => {
    jest.mocked(prisma.$transaction).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: 'test' }),
    );
    expect((await POST(request({ consent: true, reviews: [{ index: 1, rating: 5 }] }), context)).status).toBe(409);
  });
});
