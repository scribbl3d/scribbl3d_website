/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { loadReviewContext } from '@/lib/reviews/reviewableItems';
import {
  buildReviewShareMessage,
  getAdminReviewInfo,
  recordReviewEmailSent,
  recordReviewShare,
} from '@/lib/reviews/requests';
import { orderDeliveredTemplate } from '@/lib/email/templates/orderDelivered';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    reviewRequest: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), upsert: jest.fn() },
    order: { findUnique: jest.fn() },
  },
}));
jest.mock('@/lib/reviews/reviewableItems', () => ({ loadReviewContext: jest.fn() }));

const rr = prisma.reviewRequest as unknown as Record<string, jest.Mock>;
const now = new Date('2026-12-15T10:00:00Z');
const open = (overrides: Record<string, unknown> = {}) => ({
  state: 'open',
  orderReviewed: false,
  items: [{ index: 0, reviewed: false }, { index: 1, reviewed: false }],
  ...overrides,
});

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.NEXT_PUBLIC_APP_URL = 'https://www.scribbl3d.com';
  process.env.REVIEW_LAUNCH_AT = '2026-11-01T00:00:00Z';
  Object.values(rr).forEach((fn) => fn.mockReset());
  jest.mocked(prisma.order.findUnique).mockReset();
  jest.mocked(loadReviewContext).mockReset();
});

describe('getAdminReviewInfo', () => {
  it.each([
    ['not_shared', open(), null],
    ['shared', open(), { shareCount: 2, emailSentAt: null }],
    ['shared', open(), { shareCount: 0, emailSentAt: now }],
    ['partial', open({ orderReviewed: true }), { shareCount: 1 }],
    ['partial', open({ items: [{ index: 0, reviewed: true }, { index: 1, reviewed: false }] }), null],
    ['reviewed', { state: 'completed' }, { shareCount: 1 }],
    ['expired', { state: 'expired' }, null],
    ['not_eligible', { state: 'ineligible' }, null],
  ])('reports %s', async (status, context, request) => {
    jest.mocked(loadReviewContext).mockResolvedValue(context as any);
    rr.findUnique.mockResolvedValue(request);
    const info = await getAdminReviewInfo('order_1', now);
    expect(info.status).toBe(status);
    expect(info.canShare).toBe(context.state === 'open');
  });
});

describe('recordReviewShare', () => {
  it('starts the coupon window at the first share for pre-launch orders', async () => {
    rr.findUnique.mockResolvedValue(null);
    await recordReviewShare('order_1', new Date('2026-06-20T00:00:00Z'), now);
    expect(rr.create).toHaveBeenCalledWith({
      data: { orderId: 'order_1', firstSharedAt: now, lastSharedAt: now, shareCount: 1, couponWindowStartsAt: now },
    });
  });

  it('uses the delivery date for post-launch orders', async () => {
    const delivered = new Date('2026-12-10T00:00:00Z');
    rr.findUnique.mockResolvedValue(null);
    await recordReviewShare('order_1', delivered, now);
    expect(rr.create.mock.calls[0][0].data.couponWindowStartsAt).toEqual(delivered);
  });

  it('keeps the first share time and existing window on later shares', async () => {
    const first = new Date('2026-12-01T00:00:00Z');
    rr.findUnique.mockResolvedValue({ firstSharedAt: first, couponWindowStartsAt: first });
    await recordReviewShare('order_1', null, now);
    expect(rr.update).toHaveBeenCalledWith({
      where: { orderId: 'order_1' },
      data: { firstSharedAt: first, lastSharedAt: now, shareCount: { increment: 1 }, couponWindowStartsAt: first },
    });
  });
});

describe('recordReviewEmailSent', () => {
  it('records the email and sets the window only for post-launch orders', async () => {
    const delivered = new Date('2026-12-10T00:00:00Z');
    jest.mocked(prisma.order.findUnique).mockResolvedValue({ deliveredAt: delivered } as any);
    await recordReviewEmailSent('order_1', now);
    expect(rr.upsert).toHaveBeenCalledWith({
      where: { orderId: 'order_1' },
      create: { orderId: 'order_1', emailSentAt: now, couponWindowStartsAt: delivered },
      update: { emailSentAt: now },
    });

    jest.mocked(prisma.order.findUnique).mockResolvedValue({ deliveredAt: new Date('2026-06-01T00:00:00Z') } as any);
    await recordReviewEmailSent('order_2', now);
    expect(rr.upsert.mock.calls[1][0].create.couponWindowStartsAt).toBeNull();
  });
});

describe('review link in messages', () => {
  it('builds the WhatsApp message in the supplied wording', () => {
    const message = buildReviewShareMessage('Asha Rao', 'clorder12345678');
    const lines = message.split('\n');
    expect(lines[0]).toBe('Hi Asha,');
    expect(lines[1]).toBe('How was your SCRIBBL3D experience?');
    expect(lines[2]).toBe('We’d love to hear your feedback. Leave a review and get a discount coupon for your next purchase.');
    expect(lines[3]).toMatch(/^👉 https:\/\/www\.scribbl3d\.com\/review\/clorder12345678\.[A-Za-z0-9_-]+$/);
    expect(lines[4]).toBe('It only takes a minute. Thank you for choosing SCRIBBL3D!');
    expect(buildReviewShareMessage(null, 'clorder12345678')).toMatch(/^Hi there,/);
  });

  it('puts the review link (not the profile page) in the delivered email', () => {
    const html = orderDeliveredTemplate({ orderId: 'clorder12345678', customerName: 'Asha Rao' } as any);
    expect(html).toMatch(/\/review\/clorder12345678\.[A-Za-z0-9_-]+/);
    expect(html).not.toContain('/profile/orders/');
    expect(html).toContain('How was your experience?');
    expect(html).toContain('Review your order');
    expect(html).toContain('It only takes a few minutes.');
    for (const n of [1, 2, 3, 4, 5]) expect(html).toMatch(new RegExp(`/review/clorder12345678\\.[A-Za-z0-9_-]+\\?rating=${n}"`));
  });
});
