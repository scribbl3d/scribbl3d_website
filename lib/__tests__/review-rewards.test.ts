/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import {
  cancelReviewReward,
  couponWindowStart,
  generateCouponCode,
  isWithinCouponWindow,
  issueReviewReward,
  rewardReviewSubmission,
} from '@/lib/reviews/rewards';
import { sendReviewCouponEmail } from '@/lib/email/index';
import { reviewCouponTemplate } from '@/lib/email/templates/reviewCoupon';

jest.mock('@/lib/prisma', () => {
  const tx = {
    discount: { create: jest.fn() },
    reviewReward: { create: jest.fn() },
    productReview: { updateMany: jest.fn() },
    orderReview: { updateMany: jest.fn() },
  };
  return {
    prisma: {
      order: { findUnique: jest.fn() },
      reviewReward: { findUnique: jest.fn(), update: jest.fn((a) => a) },
      discount: { update: jest.fn((a) => a) },
      $transaction: jest.fn((arg) => (typeof arg === 'function' ? arg(tx) : Promise.all(arg))),
      __tx: tx,
    },
  };
});
jest.mock('@/lib/email/index', () => ({ sendReviewCouponEmail: jest.fn() }));

const p = prisma as any;
const tx = p.__tx;
const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-12-15T10:00:00Z');

beforeEach(() => {
  process.env.REVIEW_LAUNCH_AT = '2026-11-01T00:00:00Z';
  [p.order.findUnique, p.reviewReward.findUnique, p.reviewReward.update, p.discount.update, p.$transaction].forEach((fn: jest.Mock) => fn.mockClear());
  Object.values(tx).forEach((m: any) => Object.values(m).forEach((fn: any) => fn.mockReset()));
  tx.discount.create.mockResolvedValue({ id: 'disc_1' });
  p.reviewReward.findUnique.mockReset().mockResolvedValue(null);
  jest.mocked(sendReviewCouponEmail).mockReset().mockResolvedValue({ ok: true } as any);
});

describe('coupon window', () => {
  it('uses the stored start, else the delivery date for post-launch orders', () => {
    const stored = new Date('2026-12-01T00:00:00Z');
    expect(couponWindowStart(new Date('2026-12-10T00:00:00Z'), stored)).toBe(stored);
    expect(couponWindowStart(new Date('2026-12-10T00:00:00Z'), null)).toEqual(new Date('2026-12-10T00:00:00Z'));
  });

  it('has no window for pre-launch orders that were never shared', () => {
    expect(couponWindowStart(new Date('2026-06-01T00:00:00Z'), null)).toBeNull();
    expect(couponWindowStart(null, null)).toBeNull();
  });

  it('is open for exactly 15 days', () => {
    const start = new Date(now.getTime() - 15 * DAY);
    expect(isWithinCouponWindow(start, now)).toBe(true);
    expect(isWithinCouponWindow(new Date(start.getTime() - 1), now)).toBe(false);
    expect(isWithinCouponWindow(null, now)).toBe(false);
  });

  it('generates readable REV codes', () => {
    for (let i = 0; i < 20; i++) expect(generateCouponCode()).toMatch(/^REV[A-HJ-NP-Z2-9]{8}$/);
  });
});

describe('issueReviewReward', () => {
  const order = (overrides: Record<string, unknown> = {}) => ({
    userId: 'user_1',
    deliveredAt: new Date(now.getTime() - 5 * DAY),
    reviewRequest: null,
    ...overrides,
  });

  it('creates a 5% / ₹500, single-use, customer-locked coupon valid 15 days', async () => {
    p.order.findUnique.mockResolvedValue(order());
    const reward = await issueReviewReward('clorder12345678', now);
    expect(reward).toEqual({ code: expect.stringMatching(/^REV/), issuedAt: now, expiresAt: new Date(now.getTime() + 15 * DAY) });
    expect(tx.discount.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        scope: 'cart', valueType: 'percentage', value: 5, maxDiscount: 500, minOrderValue: null,
        isHidden: true, isActive: true, firstOrderOnly: false, maxUsesPerUser: 1, userId: 'user_1',
        expiresAt: new Date(now.getTime() + 15 * DAY), name: 'Review reward · order #12345678',
      }),
      select: { id: true },
    });
    expect(tx.reviewReward.create).toHaveBeenCalledWith({ data: { orderId: 'clorder12345678', userId: 'user_1', discountId: 'disc_1', issuedAt: now } });
    expect(tx.productReview.updateMany).toHaveBeenCalledWith({ where: { orderId: 'clorder12345678', isIncentivised: false }, data: { isIncentivised: true } });
    expect(tx.orderReview.updateMany).toHaveBeenCalled();
  });

  it('issues nothing outside the window', async () => {
    p.order.findUnique.mockResolvedValue(order({ deliveredAt: new Date(now.getTime() - 16 * DAY) }));
    expect(await issueReviewReward('o', now)).toBeNull();
    expect(tx.discount.create).not.toHaveBeenCalled();
  });

  it('uses the first-share window for pre-launch orders', async () => {
    p.order.findUnique.mockResolvedValue(order({ deliveredAt: new Date('2026-06-01T00:00:00Z'), reviewRequest: { couponWindowStartsAt: new Date(now.getTime() - 3 * DAY) } }));
    expect(await issueReviewReward('o', now)).not.toBeNull();
  });

  it('issues only one coupon per order, but labels later reviews incentivised', async () => {
    p.order.findUnique.mockResolvedValue(order());
    p.reviewReward.findUnique.mockResolvedValue({ id: 'rw_1' });
    expect(await issueReviewReward('o', now)).toBeNull();
    expect(tx.discount.create).not.toHaveBeenCalled();
    expect(tx.productReview.updateMany).toHaveBeenCalled();
  });

  it('returns null when a concurrent submission created the reward first', async () => {
    p.order.findUnique.mockResolvedValue(order());
    tx.reviewReward.create.mockRejectedValue(Object.assign(new Error('dup'), { code: 'P2002', meta: { target: ['orderId'] } }));
    expect(await issueReviewReward('o', now)).toBeNull();
  });

  it('retries with a new code on a code collision', async () => {
    p.order.findUnique.mockResolvedValue(order());
    tx.discount.create
      .mockRejectedValueOnce(Object.assign(new Error('dup'), { code: 'P2002', meta: { target: ['code'] } }))
      .mockResolvedValue({ id: 'disc_2' });
    expect(await issueReviewReward('o', now)).not.toBeNull();
    expect(tx.discount.create).toHaveBeenCalledTimes(2);
  });
});

describe('rewardReviewSubmission', () => {
  it('emails the coupon to the account email', async () => {
    p.order.findUnique
      .mockResolvedValueOnce({ userId: 'user_1', deliveredAt: new Date(now.getTime() - DAY), reviewRequest: null })
      .mockResolvedValueOnce({ user: { email: 'asha@example.com' } });
    expect(await rewardReviewSubmission('o', 'Asha Rao', now)).toEqual({ issued: true });
    expect(sendReviewCouponEmail).toHaveBeenCalledWith('asha@example.com', expect.objectContaining({
      customerName: 'Asha Rao', couponCode: expect.stringMatching(/^REV/), reviewDate: now, expiryDate: new Date(now.getTime() + 15 * DAY),
    }));
  });

  it('sends nothing when no coupon is issued and never throws', async () => {
    p.order.findUnique.mockResolvedValue({ userId: 'u', deliveredAt: new Date(now.getTime() - 30 * DAY), reviewRequest: null });
    expect(await rewardReviewSubmission('o', 'A', now)).toEqual({ issued: false });
    expect(sendReviewCouponEmail).not.toHaveBeenCalled();

    p.order.findUnique.mockRejectedValue(new Error('db down'));
    expect(await rewardReviewSubmission('o', 'A', now)).toEqual({ issued: false });
  });
});

describe('cancelReviewReward (C7)', () => {
  it('deactivates the coupon once', async () => {
    p.reviewReward.findUnique.mockResolvedValue({ id: 'rw_1', discountId: 'disc_1', cancelledAt: null });
    expect(await cancelReviewReward('o', now)).toBe(true);
    expect(p.discount.update).toHaveBeenCalledWith({ where: { id: 'disc_1' }, data: { isActive: false } });
    expect(p.reviewReward.update).toHaveBeenCalledWith({ where: { id: 'rw_1' }, data: { cancelledAt: now } });

    p.reviewReward.findUnique.mockResolvedValue({ id: 'rw_1', discountId: 'disc_1', cancelledAt: now });
    expect(await cancelReviewReward('o', now)).toBe(false);
  });

  it('does nothing without a reward', async () => {
    expect(await cancelReviewReward('o', now)).toBe(false);
  });
});

describe('coupon email', () => {
  it('uses the supplied wording with code and dates', () => {
    const html = reviewCouponTemplate({
      customerName: 'Asha Rao', couponCode: 'REVABCD2345',
      reviewDate: new Date('2026-10-10T06:00:00Z'), expiryDate: new Date('2026-10-25T06:00:00Z'),
    });
    expect(html).toContain('Hi Asha,');
    expect(html).toContain('Thank you for taking the time to share your experience with SCRIBBL3D.');
    expect(html).toContain('REVABCD2345');
    expect(html).toContain('5% upto 500 rupees');
    expect(html).toContain('Valid for 15 days');
    expect(html).toContain('10 October 2026');
    expect(html).toContain('25 October 2026');
    expect(html).toContain('We’ve added your SCRIBBL3D coupon below.');
    expect(html).not.toContain('attached');
    expect(html).toContain('Shop SCRIBBL3D');
    expect(html).toContain('Team SCRIBBL3D');
  });
});
