/**
 * @jest-environment node
 */
import axios from 'axios';
import { db } from '@/lib/db';
import { phonepeRefundHost } from '@/lib/payments/phonepe';
import { initiatePhonePeRefund, PhonePeRefundRejectedError } from '@/lib/refund';
import { checkPhonePeRefundStatus } from '@/lib/refundStatus';
import { cancelOrderShipments } from '@/lib/shipment/cancelShipments';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('@/lib/db', () => ({ db: { shipment: { update: jest.fn() }, order: { findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() } } }));
jest.mock('@/lib/refundStatus', () => ({ ...jest.requireActual('@/lib/refundStatus'), checkPhonePeRefundStatus: jest.fn() }));
// Handlers check the admin session themselves; tests run as a signed-in admin
jest.mock('@/lib/admin-guard', () => ({ requireAdmin: jest.fn().mockResolvedValue(null) }));
jest.mock('next/server', () => ({ NextResponse: { json: (data: unknown) => ({ status: 200, json: async () => data }) } }));

const SALT = 'super-secret-salt';
const env = process.env as Record<string, string | undefined>;
const d = db as any;

beforeEach(() => {
  env.PHONEPE_SALT_KEY = SALT;
  env.PHONEPE_MERCHANT_ID = 'MERCHANT';
  env.PHONEPE_REFUND_URL = 'https://refunds.test/';
  jest.mocked(axios.post).mockReset();
  Object.values(d).forEach((m: any) => Object.values(m).forEach((fn: any) => fn.mockReset()));
});

describe('phonepeRefundHost', () => {
  it('uses PHONEPE_REFUND_URL, defaults only in production, and fails fast elsewhere', () => {
    expect(phonepeRefundHost()).toBe('https://refunds.test');
    delete env.PHONEPE_REFUND_URL;
    const nodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';
    expect(phonepeRefundHost()).toBe('https://mercury-t2.phonepe.com');
    env.NODE_ENV = 'development';
    expect(() => phonepeRefundHost()).toThrow(/PHONEPE_REFUND_URL/);
    env.NODE_ENV = nodeEnv;
  });
});

describe('initiatePhonePeRefund', () => {
  const params = { refundTransactionId: 'RFD_o1', providerReferenceId: 'OMO1', amount: 10000, orderId: 'o1' };

  it('never logs the salt, signature or payload', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({ status: 200, json: async () => ({ success: true, code: 'PAYMENT_SUCCESS' }) }) as any;
    await initiatePhonePeRefund(params);
    const logged = JSON.stringify(log.mock.calls);
    const headers = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(logged).not.toContain(SALT);
    expect(logged).not.toContain(headers['X-VERIFY']);
    expect(logged).not.toContain(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body).request);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('https://refunds.test/v3/credit/backToSource');
    log.mockRestore();
  });

  it('marks an explicit PhonePe refusal as rejected', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({ status: 400, json: async () => ({ success: false, code: 'BAD_REQUEST' }) }) as any;
    await expect(initiatePhonePeRefund(params)).rejects.toBeInstanceOf(PhonePeRefundRejectedError);
  });
});

describe('cancelOrderShipments', () => {
  it('marks a waybill cancelled only when Delhivery confirms', async () => {
    jest.mocked(axios.post)
      .mockResolvedValueOnce({ data: { status: true } })
      .mockResolvedValueOnce({ data: { status: false, remark: 'Already picked' } });
    const result = await cancelOrderShipments([
      { id: 's1', waybill: 'W1', status: 'manifested' },
      { id: 's2', waybill: 'W2', status: 'manifested' },
    ]);
    expect(result.ok).toBe(false);
    expect(d.shipment.update).toHaveBeenCalledTimes(1);
    expect(d.shipment.update).toHaveBeenCalledWith({ where: { id: 's1' }, data: { status: 'cancelled' } });
  });

  it('refuses parcels already in transit without calling Delhivery', async () => {
    const result = await cancelOrderShipments([{ id: 's1', waybill: 'W1', status: 'In Transit' }]);
    expect(result).toEqual({ ok: false, inTransit: true, results: [] });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('skips cancelled/delivered rows', async () => {
    const result = await cancelOrderShipments([{ id: 's1', waybill: 'W1', status: 'cancelled' }, { id: 's2', waybill: 'W2', status: 'delivered' }]);
    expect(result.ok).toBe(true);
    expect(axios.post).not.toHaveBeenCalled();
  });
});

describe('POST /api/internal/sync-refunds', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const { POST } = require('@/app/api/internal/sync-refunds/route');
  const old = new Date(Date.now() - 60 * 60 * 1000);

  it('records failures (even when success is false) so admins can retry', async () => {
    d.order.findMany.mockResolvedValue([{ id: 'o1', status: 'cancelled', refundId: 'RFD_o1', refundStatus: 'pending', refundInitiatedAt: old }]);
    jest.mocked(checkPhonePeRefundStatus).mockResolvedValue({ success: false, code: 'PAYMENT_ERROR' });
    await POST();
    expect(d.order.update).toHaveBeenCalledWith({ where: { id: 'o1' }, data: { refundStatus: 'failed' } });
  });

  it('waits before treating a just-sent refund as not found', async () => {
    d.order.findMany.mockResolvedValue([{ id: 'o1', status: 'confirmed', refundId: 'RFD_o1', refundStatus: 'requested', refundInitiatedAt: new Date() }]);
    jest.mocked(checkPhonePeRefundStatus).mockResolvedValue({ success: false, code: 'TRANSACTION_NOT_FOUND' });
    await POST();
    expect(d.order.update).not.toHaveBeenCalled();
    expect(d.order.updateMany).not.toHaveBeenCalled();
  });

  it('releases an interrupted cancellation PhonePe never received', async () => {
    d.order.findMany.mockResolvedValue([{ id: 'o1', status: 'confirmed', refundId: 'RFD_o1', refundStatus: 'requested', refundInitiatedAt: old }]);
    jest.mocked(checkPhonePeRefundStatus).mockResolvedValue({ success: false, code: 'TRANSACTION_NOT_FOUND' });
    await POST();
    expect(d.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'o1', refundId: 'RFD_o1' },
      data: { refundId: null, refundStatus: null, refundInitiatedAt: null },
    });
  });

  it('completes successful refunds', async () => {
    d.order.findMany.mockResolvedValue([{ id: 'o1', status: 'cancelled', refundId: 'RFD_o1', refundStatus: 'initiated', refundInitiatedAt: old }]);
    jest.mocked(checkPhonePeRefundStatus).mockResolvedValue({ success: true, code: 'PAYMENT_SUCCESS' });
    await POST();
    expect(d.order.update).toHaveBeenCalledWith({ where: { id: 'o1' }, data: expect.objectContaining({ refundStatus: 'success', status: 'cancelled' }) });
  });
});
