/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { GET as statusGET } from '@/app/api/admin/reviews/status/route';
import { POST as sharePOST } from '@/app/api/admin/reviews/share/route';
import { GET as detailsGET } from '@/app/api/admin/reviews/[orderId]/route';
import { isAdminRequest } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { getAdminReviewInfo, recordReviewShare } from '@/lib/reviews/requests';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { order: { findUnique: jest.fn() } } }));
jest.mock('@/lib/reviews/requests', () => ({
  ...jest.requireActual('@/lib/reviews/requests'),
  getAdminReviewInfo: jest.fn(),
  recordReviewShare: jest.fn(),
}));

const info = (overrides: Record<string, unknown> = {}) => ({
  status: 'not_shared', canShare: true, emailSentAt: null, firstSharedAt: null, lastSharedAt: null, shareCount: 0, ...overrides,
});
const getReq = (url: string) => ({ nextUrl: new URL(url) }) as unknown as NextRequest;
const postReq = (body: unknown) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(true);
  jest.mocked(getAdminReviewInfo).mockReset().mockResolvedValue(info() as any);
  jest.mocked(recordReviewShare).mockReset().mockResolvedValue({} as any);
  jest.mocked(prisma.order.findUnique).mockReset();
});

describe('admin review APIs', () => {
  it('require a verified admin', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(false);
    expect((await statusGET(getReq('http://x/api/admin/reviews/status?orderIds=a'))).status).toBe(401);
    expect((await sharePOST(postReq({ orderId: 'a' }))).status).toBe(401);
    expect((await detailsGET(getReq('http://x'), { params: Promise.resolve({ orderId: 'a' }) })).status).toBe(401);
    expect(recordReviewShare).not.toHaveBeenCalled();
  });

  it('returns statuses for valid order IDs and ignores junk', async () => {
    const res = await statusGET(getReq('http://x/api/admin/reviews/status?orderIds=a,b,a,../x'));
    expect(res.status).toBe(200);
    expect(Object.keys(await res.json())).toEqual(['a', 'b']);
  });

  it('caps the number of orders per status request', async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `o${i}`).join(',');
    expect((await statusGET(getReq(`http://x/api/admin/reviews/status?orderIds=${ids}`))).status).toBe(400);
  });

  it('refuses to share a link that is closed', async () => {
    jest.mocked(getAdminReviewInfo).mockResolvedValue(info({ status: 'reviewed', canShare: false }) as any);
    expect((await sharePOST(postReq({ orderId: 'order_1' }))).status).toBe(409);
    expect(recordReviewShare).not.toHaveBeenCalled();
  });

  it('records a share and returns the link and WhatsApp message', async () => {
    const delivered = new Date('2026-06-20T00:00:00Z');
    jest.mocked(prisma.order.findUnique).mockResolvedValue({
      deliveredAt: delivered, shippingAddress: { fullName: 'Asha Rao' }, user: { name: 'A' },
    } as any);
    jest.mocked(getAdminReviewInfo)
      .mockResolvedValueOnce(info() as any)
      .mockResolvedValueOnce(info({ status: 'shared', shareCount: 1 }) as any);

    const res = await sharePOST(postReq({ orderId: 'order_1' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(recordReviewShare).toHaveBeenCalledWith('order_1', delivered);
    expect(body.url).toMatch(/\/review\/order_1\./);
    expect(body.message).toContain('Hi Asha,');
    expect(body.message).toContain(body.url);
    expect(body.info.status).toBe('shared');
  });

  it('rejects an invalid order ID on share', async () => {
    expect((await sharePOST(postReq({ orderId: '../etc' }))).status).toBe(400);
  });

  it('returns sharing history and reviews with product names', async () => {
    jest.mocked(prisma.order.findUnique).mockResolvedValue({
      items: [{ name: 'PETG Red' }, { name: 'PETG Blue' }],
      orderReview: null,
      reviews: [{ orderItemIndex: 1, rating: 2, content: 'Clogged', tags: [], status: 'PENDING', isIncentivised: false, variantLabel: 'Blue', createdAt: 'x' }],
    } as any);
    const res = await detailsGET(getReq('http://x'), { params: Promise.resolve({ orderId: 'order_1' }) });
    const body = await res.json();
    expect(body.productReviews[0].productName).toBe('PETG Blue');
    expect(body.orderReview).toBeNull();
  });
});
