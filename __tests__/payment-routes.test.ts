/**
 * @jest-environment node
 */
import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { confirmPayment, failPayment } from '@/lib/payments/confirmPayment';
import { sendAdminNotification } from '@/lib/email/index';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('axios', () => Object.assign(jest.fn(), { get: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { order: { findUnique: jest.fn(), findFirst: jest.fn() } } }));
jest.mock('@/lib/payments/confirmPayment', () => ({ confirmPayment: jest.fn(), failPayment: jest.fn() }));
jest.mock('@/lib/email/index', () => ({ sendAdminNotification: jest.fn().mockResolvedValue({ ok: true }) }));

const SALT = 'test-salt';
process.env.PHONEPE_SALT_KEY = SALT;
process.env.PHONEPE_SALT_INDEX = '1';
process.env.PHONEPE_MERCHANT_ID = 'MERCHANT';
process.env.NEXT_PUBLIC_APP_URL = 'https://www.scribbl3d.com';

// Imported after env is set (the order route checks credentials at load)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST: orderPOST } = require('@/app/api/order/route');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { POST: callbackPOST } = require('@/app/api/phonepe-callback/route');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GET: statusGET } = require('@/app/api/check-status/[transactionId]/route');

const p = prisma as any;
const session = (id: string | null) => jest.mocked(getServerSession).mockResolvedValue(id ? ({ user: { id } } as any) : null);

beforeEach(() => {
  jest.mocked(axios as any).mockReset();
  jest.mocked(axios.get).mockReset();
  p.order.findUnique.mockReset();
  p.order.findFirst.mockReset();
  jest.mocked(confirmPayment).mockReset().mockResolvedValue('confirmed');
  jest.mocked(failPayment).mockReset().mockResolvedValue(true);
  jest.mocked(sendAdminNotification).mockClear();
  session('u1');
});

/* ------------------------------------------------------------------ */
describe('POST /api/order (start payment)', () => {
  const req = (body: unknown) => ({ json: async () => body }) as unknown as Request;
  const order = (overrides: Record<string, unknown> = {}) => ({
    id: 'order_1', userId: 'u1', status: 'payment_pending', totalAmount: 21500, transactionId: 'TXN123456789', shippingAddress: { phone: '+91 98765-43210' }, ...overrides,
  });

  it('requires a signed-in owner and an unpaid order', async () => {
    session(null);
    expect((await orderPOST(req({ orderId: 'order_1' }))).status).toBe(401);
    session('u1');
    expect((await orderPOST(req({}))).status).toBe(400);
    p.order.findUnique.mockResolvedValue(order({ userId: 'someone_else' }));
    expect((await orderPOST(req({ orderId: 'order_1' }))).status).toBe(404);
    p.order.findUnique.mockResolvedValue(order({ status: 'confirmed' }));
    expect((await orderPOST(req({ orderId: 'order_1' }))).status).toBe(409);
    expect(axios).not.toHaveBeenCalled();
  });

  it('charges the stored total with the stored transaction ID, ignoring the request amount', async () => {
    p.order.findUnique.mockResolvedValue(order());
    jest.mocked(axios as any).mockResolvedValue({ data: { success: true, data: { instrumentResponse: { redirectInfo: { url: 'https://pay' } } } } });
    const res = await orderPOST(req({ orderId: 'order_1', amount: 1, transactionId: 'TXNATTACKER', MUID: 'x' }));
    expect(res.status).toBe(200);
    const call = jest.mocked(axios as any).mock.calls[0][0];
    const payload = JSON.parse(Buffer.from(call.data.request, 'base64').toString());
    expect(payload).toEqual(expect.objectContaining({
      amount: 2150000, merchantTransactionId: 'TXN123456789', orderId: 'order_1', mobileNumber: '9876543210', merchantUserId: 'Uu1',
      callbackUrl: 'https://www.scribbl3d.com/api/phonepe-callback',
    }));
    expect(call.url).toBe('https://api.phonepe.com/apis/hermes/pg/v1/pay');
    expect(call.headers['X-VERIFY']).toBe(createHash('sha256').update(call.data.request + '/pg/v1/pay' + SALT).digest('hex') + '###1');
  });
});

/* ------------------------------------------------------------------ */
describe('POST /api/phonepe-callback', () => {
  const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64');
  const sign = (response: string) => createHash('sha256').update(response + SALT).digest('hex') + '###1';
  const callback = (decoded: unknown, checksum?: string | null) => {
    const response = encode(decoded);
    const headers = new Headers({ 'content-type': 'application/json' });
    const xVerify = checksum === undefined ? sign(response) : checksum;
    if (xVerify) headers.set('x-verify', xVerify);
    return { headers, json: async () => ({ response }) } as unknown as NextRequest;
  };
  const success = { code: 'PAYMENT_SUCCESS', data: { merchantTransactionId: 'TXN1', transactionId: 'PP1', amount: 2150000, paymentInstrument: { type: 'UPI', payerVpa: 'a@ok', utr: 'U1' } } };

  it.each([
    ['missing', null],
    ['wrong', 'deadbeef###1'],
  ])('rejects a %s checksum without touching the order', async (_label, checksum) => {
    expect((await callbackPOST(callback(success, checksum))).status).toBe(401);
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(failPayment).not.toHaveBeenCalled();
  });

  it('confirms a signed success with the paid amount', async () => {
    expect((await callbackPOST(callback(success))).status).toBe(200);
    expect(confirmPayment).toHaveBeenCalledWith('TXN1', 2150000, { paymentReference: 'PP1', paymentMethod: 'UPI', maskedPaymentId: 'a@ok', utrNumber: 'U1' }, 'callback');
  });

  it('marks a signed failure', async () => {
    await callbackPOST(callback({ code: 'PAYMENT_DECLINED', data: { merchantTransactionId: 'TXN1' } }));
    expect(failPayment).toHaveBeenCalledWith('TXN1');
    expect(confirmPayment).not.toHaveBeenCalled();
  });

  it('alerts admins about money received for an unknown transaction', async () => {
    jest.mocked(confirmPayment).mockResolvedValue('not_found');
    expect((await callbackPOST(callback(success))).status).toBe(404);
    expect(sendAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment-review' }));
  });
});

/* ------------------------------------------------------------------ */
describe('GET /api/check-status/[transactionId]', () => {
  const ctx = (transactionId: string) => ({ params: Promise.resolve({ transactionId }) });
  const req = {} as NextRequest;

  it('requires the order owner', async () => {
    session(null);
    expect((await statusGET(req, ctx('TXN1'))).status).toBe(401);
    session('u1');
    p.order.findFirst.mockResolvedValue({ id: 'o', status: 'payment_pending', userId: 'other' });
    expect((await statusGET(req, ctx('TXN1'))).status).toBe(404);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns success straight away for a paid order', async () => {
    p.order.findFirst.mockResolvedValue({ id: 'o', status: 'confirmed', userId: 'u1' });
    expect(await (await statusGET(req, ctx('TXN1'))).json()).toEqual(expect.objectContaining({ success: true }));
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('asks PhonePe production and confirms with the paid amount', async () => {
    p.order.findFirst.mockResolvedValue({ id: 'o', status: 'payment_pending', userId: 'u1' });
    jest.mocked(axios.get).mockResolvedValue({ data: { success: true, code: 'PAYMENT_SUCCESS', data: { amount: 2150000, transactionId: 'PP1', paymentInstrument: { type: 'UPI' } } } });
    const body = await (await statusGET(req, ctx('TXN1'))).json();
    expect(body).toEqual({ success: true, code: 'PAYMENT_SUCCESS' });
    expect(jest.mocked(axios.get).mock.calls[0][0]).toBe('https://api.phonepe.com/apis/hermes/pg/v1/status/MERCHANT/TXN1');
    expect(confirmPayment).toHaveBeenCalledWith('TXN1', 2150000, expect.objectContaining({ paymentReference: 'PP1' }), 'status-check');
  });

  it('reports a review instead of success when the amount does not match', async () => {
    p.order.findFirst.mockResolvedValue({ id: 'o', status: 'payment_pending', userId: 'u1' });
    jest.mocked(axios.get).mockResolvedValue({ data: { success: true, code: 'PAYMENT_SUCCESS', data: { amount: 100 } } });
    jest.mocked(confirmPayment).mockResolvedValue('amount_mismatch');
    expect(await (await statusGET(req, ctx('TXN1'))).json()).toEqual(expect.objectContaining({ success: false, code: 'PAYMENT_REVIEW' }));
  });
});
