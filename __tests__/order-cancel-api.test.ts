import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/admin/orders/[orderId]/cancel/route';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-session';
import { initiatePhonePeRefund } from '@/lib/refund';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/db', () => ({ db: { order: { findUnique: jest.fn(), update: jest.fn() } } }));
jest.mock('@/lib/refund', () => ({ initiatePhonePeRefund: jest.fn() }));
jest.mock('@/lib/email/index', () => ({ sendOrderCancelled: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/email/mapOrderToEmailData', () => ({ mapOrderToCancelEmailData: jest.fn() }));

const orderId = 'order_1';
const context = { params: { orderId } };
const request = (body: unknown = {}) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;
const order = (overrides: Record<string, unknown> = {}) => ({
  id: orderId, userId: 'user_1', status: 'confirmed', refundId: null, paymentReference: 'OMO1',
  totalAmount: 100, user: { email: null }, shipments: [], ...overrides,
});

beforeEach(() => {
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(false);
  jest.mocked(getServerSession).mockReset().mockResolvedValue(null);
  (db.order.findUnique as jest.Mock).mockReset();
  (db.order.update as jest.Mock).mockReset().mockResolvedValue({});
  jest.mocked(initiatePhonePeRefund).mockReset().mockResolvedValue({ success: true } as any);
});

describe('Order cancel API', () => {
  it('rejects anonymous requests before reading the order', async () => {
    expect((await POST(request(), context)).status).toBe(401);
    expect(db.order.findUnique).not.toHaveBeenCalled();
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it("hides other customers' orders", async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'someone_else' } } as any);
    (db.order.findUnique as jest.Mock).mockResolvedValue(order());
    expect((await POST(request(), context)).status).toBe(404);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('blocks customers once the shipment has been picked up', async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any);
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'shipped', shipments: [{ isMaster: true, status: 'in transit' }] }));
    expect((await POST(request(), context)).status).toBe(409);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('blocks a second cancel so no duplicate refund is sent', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'cancelled', refundId: 'RFD_1' }));
    expect((await POST(request(), context)).status).toBe(409);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('lets the owning customer cancel a confirmed order and ignores a spoofed cancelledBy', async () => {
    jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any);
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ user: { email: 'c@example.com' } }));
    const { mapOrderToCancelEmailData } = jest.requireMock('@/lib/email/mapOrderToEmailData');
    expect((await POST(request({ cancelledBy: 'admin' }), context)).status).toBe(200);
    expect(initiatePhonePeRefund).toHaveBeenCalledTimes(1);
    expect(mapOrderToCancelEmailData).toHaveBeenCalledWith(expect.anything(), 'customer', undefined);
  });

  it('lets a verified admin cancel', async () => {
    jest.mocked(isAdminRequest).mockResolvedValue(true);
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'shipped', shipments: [{ isMaster: true, status: 'in transit' }] }));
    expect((await POST(request(), context)).status).toBe(200);
    expect(getServerSession).not.toHaveBeenCalled();
  });
});
