import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/admin/orders/[orderId]/cancel/route';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-session';
import { initiatePhonePeRefund, refundConfigError } from '@/lib/refund';
import { cancelOrderShipments } from '@/lib/shipment/cancelShipments';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('@/lib/admin-session', () => ({ isAdminRequest: jest.fn() }));
jest.mock('@/lib/db', () => ({ db: { order: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() } } }));
jest.mock('@/lib/refund', () => {
  class PhonePeRefundRejectedError extends Error {}
  return { initiatePhonePeRefund: jest.fn(), refundConfigError: jest.fn(), PhonePeRefundRejectedError };
});
jest.mock('@/lib/shipment/cancelShipments', () => ({ cancelOrderShipments: jest.fn() }));
jest.mock('@/lib/reviews/rewards', () => ({ cancelReviewReward: jest.fn().mockResolvedValue(false) }));
jest.mock('@/lib/email/index', () => ({ sendOrderCancelled: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/email/mapOrderToEmailData', () => ({ mapOrderToCancelEmailData: jest.fn() }));

const orderId = 'order_1';
const context = { params: Promise.resolve({ orderId }) };
const request = (body: unknown = {}) => ({ json: jest.fn().mockResolvedValue(body) }) as unknown as NextRequest;
const order = (overrides: Record<string, unknown> = {}) => ({
  id: orderId, userId: 'user_1', status: 'confirmed', refundId: null, refundStatus: null, paymentReference: 'OMO1',
  totalAmount: 100, user: { email: null }, shipments: [], ...overrides,
});
const { PhonePeRefundRejectedError } = jest.requireMock('@/lib/refund');
const customer = () => jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'user_1' } } as any);
const admin = () => jest.mocked(isAdminRequest).mockResolvedValue(true);

beforeEach(() => {
  jest.mocked(isAdminRequest).mockReset().mockResolvedValue(false);
  jest.mocked(getServerSession).mockReset().mockResolvedValue(null);
  (db.order.findUnique as jest.Mock).mockReset();
  (db.order.update as jest.Mock).mockReset().mockResolvedValue({});
  (db.order.updateMany as jest.Mock).mockReset().mockResolvedValue({ count: 1 });
  jest.mocked(initiatePhonePeRefund).mockReset().mockResolvedValue({ success: true } as any);
  jest.mocked(refundConfigError).mockReset().mockReturnValue(null);
  jest.mocked(cancelOrderShipments).mockReset().mockResolvedValue({ ok: true, inTransit: false, results: [] });
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
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'shipped', shipments: [{ isMaster: true, status: 'in transit' }] }));
    expect((await POST(request(), context)).status).toBe(409);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('blocks a second cancel so no duplicate refund is sent', async () => {
    admin();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'cancelled', refundId: 'RFD_1', refundStatus: 'initiated' }));
    expect((await POST(request(), context)).status).toBe(409);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('lets only one concurrent request claim the refund', async () => {
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order());
    (db.order.updateMany as jest.Mock).mockResolvedValue({ count: 0 }); // another request won
    expect((await POST(request(), context)).status).toBe(409);
    expect(cancelOrderShipments).not.toHaveBeenCalled();
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
  });

  it('cancels a manifested shipment and refunds in one call (customer)', async () => {
    customer();
    const shipments = [{ id: 's1', isMaster: true, status: 'manifested', waybill: 'W1' }];
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ shipments, user: { email: 'c@example.com' } }));
    const { mapOrderToCancelEmailData } = jest.requireMock('@/lib/email/mapOrderToEmailData');
    const res = await POST(request({ cancelledBy: 'admin' }), context);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, refundStatus: 'initiated' });
    expect(db.order.updateMany).toHaveBeenCalledWith({
      where: { id: orderId, refundId: null, status: { not: 'cancelled' } },
      data: expect.objectContaining({ refundId: 'RFD_order_1', refundStatus: 'requested' }),
    });
    expect(cancelOrderShipments).toHaveBeenCalledWith(shipments);
    expect(initiatePhonePeRefund).toHaveBeenCalledWith({ refundTransactionId: 'RFD_order_1', providerReferenceId: 'OMO1', amount: 10000, orderId });
    expect(db.order.update).toHaveBeenCalledWith({ where: { id: orderId }, data: { status: 'cancelled', refundStatus: 'initiated' } });
    expect(jest.requireMock('@/lib/reviews/rewards').cancelReviewReward).toHaveBeenCalledWith('order_1');
    expect(mapOrderToCancelEmailData).toHaveBeenCalledWith(expect.anything(), 'customer', undefined);
  });

  it('does not refund and releases the claim when the courier refuses the cancellation', async () => {
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ shipments: [{ id: 's1', isMaster: true, status: 'manifested', waybill: 'W1' }] }));
    jest.mocked(cancelOrderShipments).mockResolvedValue({ ok: false, inTransit: false, results: [{ waybill: 'W1', success: false }] });
    expect((await POST(request(), context)).status).toBe(502);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
    expect(db.order.updateMany).toHaveBeenLastCalledWith({
      where: { id: orderId, refundId: 'RFD_order_1' },
      data: { refundId: null, refundStatus: null, refundInitiatedAt: null },
    });
  });

  it('stops an admin refund while the parcel is in transit', async () => {
    admin();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'shipped', shipments: [{ id: 's1', isMaster: true, status: 'in transit', waybill: 'W1' }] }));
    jest.mocked(cancelOrderShipments).mockResolvedValue({ ok: false, inTransit: true, results: [] });
    expect((await POST(request(), context)).status).toBe(409);
    expect(initiatePhonePeRefund).not.toHaveBeenCalled();
    expect(getServerSession).not.toHaveBeenCalled();
  });

  it('records a rejected refund as failed and a timed-out one as pending', async () => {
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order());
    jest.mocked(initiatePhonePeRefund).mockRejectedValue(new PhonePeRefundRejectedError('declined'));
    expect(await (await POST(request(), context)).json()).toEqual({ success: true, refundStatus: 'failed' });

    jest.mocked(initiatePhonePeRefund).mockRejectedValue(new Error('timeout'));
    expect(await (await POST(request(), context)).json()).toEqual({ success: true, refundStatus: 'pending' });
  });

  it('lets an admin retry a failed refund with a new deterministic ID', async () => {
    admin();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'cancelled', refundId: 'RFD_order_1', refundStatus: 'failed' }));
    expect((await POST(request(), context)).status).toBe(200);
    expect(db.order.updateMany).toHaveBeenCalledWith({
      where: { id: orderId, status: 'cancelled', refundStatus: 'failed', refundId: 'RFD_order_1' },
      data: expect.objectContaining({ refundId: 'RFD_order_1_2' }),
    });
    expect(cancelOrderShipments).not.toHaveBeenCalled();
    expect(initiatePhonePeRefund).toHaveBeenCalledWith(expect.objectContaining({ refundTransactionId: 'RFD_order_1_2' }));
  });

  it('does not let a customer retry a failed refund', async () => {
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order({ status: 'cancelled', refundId: 'RFD_order_1', refundStatus: 'failed' }));
    expect((await POST(request(), context)).status).toBe(409);
  });

  it('changes nothing when refunds are not configured', async () => {
    customer();
    (db.order.findUnique as jest.Mock).mockResolvedValue(order());
    jest.mocked(refundConfigError).mockReturnValue('PHONEPE_REFUND_URL is not configured');
    expect((await POST(request(), context)).status).toBe(503);
    expect(db.order.updateMany).not.toHaveBeenCalled();
    expect(cancelOrderShipments).not.toHaveBeenCalled();
  });
});
