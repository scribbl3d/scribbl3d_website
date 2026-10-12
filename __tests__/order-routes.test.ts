/**
 * @jest-environment node
 */
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { getServerSession as getServerSessionRoot } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/db';
import { confirmPayment } from '@/lib/payments/confirmPayment';
import { verifyAdminSession } from '@/lib/admin-session';
import { generateInvoicePdfBuffer } from '@/lib/invoice/generateInvoicePdf';

jest.mock('next/server', () => {
  class NextResponse {
    status: number;
    constructor(_body: unknown, init: { status?: number } = {}) { this.status = init.status || 200; }
    static json(data: unknown, options: { status?: number } = {}) { return { status: options.status || 200, json: async () => data }; }
  }
  return { NextResponse };
});
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { order: { findUnique: jest.fn(), updateMany: jest.fn() } } }));
jest.mock('@/lib/db', () => ({ db: { order: { findUnique: jest.fn() } } }));
jest.mock('@/lib/payments/confirmPayment', () => ({ confirmPayment: jest.fn() }));
jest.mock('@/lib/admin-session', () => ({ verifyAdminSession: jest.fn() }));
jest.mock('@/lib/invoice/generateInvoicePdf', () => ({ generateInvoicePdfBuffer: jest.fn() }));

process.env.PHONEPE_SALT_KEY = 'test-salt';
process.env.PHONEPE_MERCHANT_ID = 'MERCHANT';

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { GET: orderGET } = require('@/app/api/orders/[orderId]/route');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { POST: retryPOST } = require('@/app/api/orders/retry-payment/route');
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { GET: invoiceGET } = require('@/app/api/orders/[orderId]/invoice/route');

const p = prisma as any;
const params = (orderId: string) => ({ params: Promise.resolve({ orderId }) });
const signedIn = (id: string | null) => {
  const value = id ? ({ user: { id } } as any) : null;
  jest.mocked(getServerSession).mockResolvedValue(value);
  jest.mocked(getServerSessionRoot).mockResolvedValue(value);
};

beforeEach(() => {
  p.order.findUnique.mockReset();
  p.order.updateMany.mockReset().mockResolvedValue({ count: 1 });
  (db.order.findUnique as jest.Mock).mockReset();
  jest.mocked(axios.get).mockReset();
  jest.mocked(confirmPayment).mockReset().mockResolvedValue('confirmed');
  jest.mocked(verifyAdminSession).mockReset().mockResolvedValue(null);
  jest.mocked(generateInvoicePdfBuffer).mockReset().mockResolvedValue({ buffer: Buffer.from('pdf'), invoiceNumber: 'INV1' } as any);
  signedIn('u1');
});

describe('GET /api/orders/[orderId]', () => {
  it('requires sign-in and ownership', async () => {
    signedIn(null);
    expect((await orderGET({} as any, params('o1'))).status).toBe(401);
    signedIn('u1');
    p.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'someone_else', user: { email: 'x@y.z' } });
    expect((await orderGET({} as any, params('o1'))).status).toBe(404);
  });

  it('returns only the success-page fields to the owner', async () => {
    p.order.findUnique.mockResolvedValue({ id: 'o1', userId: 'u1', status: 'confirmed', totalAmount: 500, createdAt: 'd', user: { email: 'me@x.com' } });
    const body = await (await orderGET({} as any, params('o1'))).json();
    expect(body).toEqual({ id: 'o1', status: 'confirmed', totalAmount: 500, createdAt: 'd', user: { email: 'me@x.com' } });
    expect(p.order.findUnique.mock.calls[0][0].select).not.toHaveProperty('shippingAddress');
  });
});

describe('POST /api/orders/retry-payment', () => {
  const req = (body: unknown) => ({ json: async () => body }) as unknown as Request;
  const body = { orderId: 'o1', newTransactionId: 'TXN_NEW_12345' };
  const pending = { id: 'o1', userId: 'u1', status: 'payment_failed', transactionId: 'TXN_OLD_12345' };

  it('confirms instead of retrying when the earlier payment succeeded', async () => {
    p.order.findUnique.mockResolvedValue(pending);
    jest.mocked(axios.get).mockResolvedValue({ data: { success: true, code: 'PAYMENT_SUCCESS', data: { amount: 50000 } } });
    const res = await retryPOST(req(body));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(expect.objectContaining({ code: 'ALREADY_PAID' }));
    expect(confirmPayment).toHaveBeenCalledWith('TXN_OLD_12345', 50000, expect.anything(), 'status-check');
    expect(p.order.updateMany).not.toHaveBeenCalled();
  });

  it('blocks a retry while the earlier payment is pending or its status is unknown', async () => {
    p.order.findUnique.mockResolvedValue(pending);
    jest.mocked(axios.get).mockResolvedValue({ data: { success: false, code: 'PAYMENT_PENDING' } });
    expect((await retryPOST(req(body))).status).toBe(409);
    jest.mocked(axios.get).mockRejectedValue(new Error('timeout'));
    expect((await retryPOST(req(body))).status).toBe(503);
    expect(p.order.updateMany).not.toHaveBeenCalled();
  });

  it('retries a failed payment atomically and refuses when the order changed meanwhile', async () => {
    p.order.findUnique.mockResolvedValue(pending);
    jest.mocked(axios.get).mockRejectedValue({ response: { data: { success: false, code: 'PAYMENT_ERROR' } } });
    expect((await retryPOST(req(body))).status).toBe(200);
    expect(p.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'o1', userId: 'u1', transactionId: 'TXN_OLD_12345', status: { in: ['payment_pending', 'payment_failed'] } },
      data: { transactionId: 'TXN_NEW_12345', status: 'payment_pending' },
    });

    p.order.updateMany.mockResolvedValue({ count: 0 }); // confirmed by the callback in between
    expect((await retryPOST(req(body))).status).toBe(409);
  });
});

describe('GET /api/orders/[orderId]/invoice', () => {
  const req = { cookies: { get: () => undefined } } as any;

  it('refuses invoices for unpaid orders', async () => {
    (db.order.findUnique as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u1', status: 'payment_failed', paymentReference: null, refundId: null });
    expect((await invoiceGET(req, params('o1'))).status).toBe(409);
    expect(generateInvoicePdfBuffer).not.toHaveBeenCalled();
  });

  it('allows paid and paid-then-refunded orders', async () => {
    (db.order.findUnique as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u1', status: 'delivered', paymentReference: 'OMO', refundId: null });
    expect((await invoiceGET(req, params('o1'))).status).toBe(200);
    (db.order.findUnique as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u1', status: 'cancelled', paymentReference: 'OMO', refundId: 'RFD_o1' });
    expect((await invoiceGET(req, params('o1'))).status).toBe(200);
  });
});
