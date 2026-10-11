/**
 * @jest-environment node
 */
import { getServerSession } from 'next-auth/next';
import { GET } from '@/app/api/discounts/route';
import { prisma } from '@/lib/prisma';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    discount: { findMany: jest.fn() },
    order: { count: jest.fn() },
    discountUsage: { groupBy: jest.fn() },
  },
}));

const p = prisma as any;
const publicCoupon = { id: 'pub', code: 'SALE10', isHidden: false, firstOrderOnly: false, maxUsesPerUser: null };
const myCoupon = { id: 'mine', code: 'REVAAAA2222', isHidden: true, userId: 'u1', firstOrderOnly: false, maxUsesPerUser: 1 };
const req = () => new Request('http://x/api/discounts');

beforeEach(() => {
  p.discount.findMany.mockReset().mockImplementation(({ where }: any) => Promise.resolve(where.userId ? [myCoupon] : [publicCoupon]));
  p.order.count.mockReset().mockResolvedValue(1);
  p.discountUsage.groupBy.mockReset().mockResolvedValue([]);
});

describe('GET /api/discounts (cart coupon list)', () => {
  it("lists the customer's own personal coupons first", async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as any);
    const codes = (await (await GET(req())).json()).map((d: any) => d.code);
    expect(codes).toEqual(['REVAAAA2222', 'SALE10']);
    expect(p.discount.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 'u1', isActive: true }) }));
  });

  it('hides a personal coupon once it has been used', async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as any);
    p.discountUsage.groupBy.mockResolvedValue([{ discountId: 'mine', _count: { id: 1 } }]);
    const codes = (await (await GET(req())).json()).map((d: any) => d.code);
    expect(codes).toEqual(['SALE10']);
  });

  it('never lists personal coupons for logged-out visitors', async () => {
    jest.mocked(getServerSession).mockResolvedValue(null);
    const codes = (await (await GET(req())).json()).map((d: any) => d.code);
    expect(codes).toEqual(['SALE10']);
    expect(p.discount.findMany).toHaveBeenCalledTimes(1);
  });
});
