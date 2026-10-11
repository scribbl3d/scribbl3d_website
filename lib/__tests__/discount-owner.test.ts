/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { validateDiscountEligibility } from '@/app/cart/utils/validateDiscountEligibility';
import { getCustomerCoupons } from '@/lib/reviews/customerCoupons';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    discount: { findUnique: jest.fn(), findMany: jest.fn() },
    discountUsage: { count: jest.fn() },
    order: { count: jest.fn() },
  },
}));

const p = prisma as any;
const personal = { id: 'd1', isActive: true, expiresAt: null, firstOrderOnly: false, maxUsesPerUser: 1, userId: 'owner' };

beforeEach(() => {
  p.discount.findUnique.mockReset();
  p.discountUsage.count.mockReset().mockResolvedValue(0);
});

describe('customer-locked coupons', () => {
  it('only works for its owner', async () => {
    p.discount.findUnique.mockResolvedValue(personal);
    expect(await validateDiscountEligibility('d1', 'owner')).toEqual({ eligible: true });
    expect(await validateDiscountEligibility('d1', 'someone_else')).toEqual({ eligible: false, reason: 'This coupon is not valid for your account' });
    expect(await validateDiscountEligibility('d1', null)).toEqual({ eligible: false, reason: 'Please log in to use this coupon' });
  });

  it('is single use', async () => {
    p.discount.findUnique.mockResolvedValue(personal);
    p.discountUsage.count.mockResolvedValue(1);
    expect((await validateDiscountEligibility('d1', 'owner')).eligible).toBe(false);
  });

  it('leaves public coupons unchanged', async () => {
    p.discount.findUnique.mockResolvedValue({ ...personal, userId: null, maxUsesPerUser: null });
    expect(await validateDiscountEligibility('d1', null)).toEqual({ eligible: true });
  });
});

describe('getCustomerCoupons', () => {
  const now = new Date('2026-10-20T00:00:00Z');
  const row = (overrides: Record<string, unknown> = {}) => ({
    code: 'REVAAAA2222', value: 5, valueType: 'percentage', maxDiscount: 500, expiresAt: new Date('2026-10-25T00:00:00Z'),
    isActive: true, maxUsesPerUser: 1, createdAt: new Date('2026-10-10T00:00:00Z'),
    reviewReward: { orderId: 'clorder12345678', cancelledAt: null, issuedAt: new Date('2026-10-10T00:00:00Z') },
    _count: { usages: 0 }, ...overrides,
  });

  it('maps status and the source order', async () => {
    p.discount.findMany.mockResolvedValue([
      row(),
      row({ code: 'USED', _count: { usages: 1 } }),
      row({ code: 'OLD', expiresAt: new Date('2026-10-15T00:00:00Z') }),
      row({ code: 'REFUNDED', isActive: false, reviewReward: { orderId: 'x', cancelledAt: new Date(), issuedAt: new Date() } }),
    ]);
    const coupons = await getCustomerCoupons('owner', now);
    expect(coupons.map((c) => c.status)).toEqual(['active', 'used', 'expired', 'cancelled']);
    expect(coupons[0].orderNumber).toBe('12345678');
    expect(p.discount.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'owner' } }));
  });
});
