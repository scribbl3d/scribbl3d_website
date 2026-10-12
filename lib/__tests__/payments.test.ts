/**
 * @jest-environment node
 */
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendAdminNotification, sendOrderConfirmation } from '@/lib/email/index';
import { confirmPayment, failPayment } from '@/lib/payments/confirmPayment';
import { isValidCallbackChecksum, paymentDetailsFrom, signRequest, toPaise } from '@/lib/payments/phonepe';

jest.mock('@/lib/prisma', () => {
  const prisma: any = {
    order: { findFirst: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn(), count: jest.fn() },
    discount: { findFirst: jest.fn() },
    discountUsage: { findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
    cart: { findFirst: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
  };
  // Interactive transaction runs against the same mocks
  prisma.$transaction = jest.fn((fn: (tx: unknown) => unknown) => fn(prisma));
  return { prisma };
});
jest.mock('@/lib/email/index', () => ({ sendAdminNotification: jest.fn(), sendOrderConfirmation: jest.fn() }));
jest.mock('@/lib/email/mapOrderToEmailData', () => ({ mapOrderToEmailData: jest.fn(() => ({})) }));

const p = prisma as any;
const SALT = 'test-salt';

beforeEach(() => {
  process.env.PHONEPE_SALT_KEY = SALT;
  process.env.PHONEPE_SALT_INDEX = '1';
  Object.values(p).forEach((m: any) => Object.values(m).forEach((fn: any) => fn.mockReset?.()));
  jest.mocked(sendAdminNotification).mockReset().mockResolvedValue({ ok: true } as any);
  jest.mocked(sendOrderConfirmation).mockReset().mockResolvedValue({ ok: true } as any);
});

describe('PhonePe helpers', () => {
  it('converts rupees to paise without float drift', () => {
    expect(toPaise(21500)).toBe(2150000);
    expect(toPaise(1234.57)).toBe(123457);
    expect(toPaise(0.1 + 0.2)).toBe(30);
  });

  it('signs requests as sha256(payload + path + salt)###index', () => {
    const expected = createHash('sha256').update('abc/pg/v1/pay' + SALT).digest('hex') + '###1';
    expect(signRequest('abc', '/pg/v1/pay')).toBe(expected);
  });

  it('reads the key index from PHONEPE_KEY_INDEX, then PHONEPE_SALT_INDEX, then defaults to 1', () => {
    const { phonepeSaltIndex } = jest.requireActual('@/lib/payments/phonepe');
    const saved = { key: process.env.PHONEPE_KEY_INDEX, salt: process.env.PHONEPE_SALT_INDEX };
    process.env.PHONEPE_KEY_INDEX = '2';
    process.env.PHONEPE_SALT_INDEX = '3';
    expect(phonepeSaltIndex()).toBe('2');
    delete process.env.PHONEPE_KEY_INDEX;
    expect(phonepeSaltIndex()).toBe('3');
    delete process.env.PHONEPE_SALT_INDEX;
    expect(phonepeSaltIndex()).toBe('1');
    process.env.PHONEPE_KEY_INDEX = saved.key;
    process.env.PHONEPE_SALT_INDEX = saved.salt;
    if (saved.key === undefined) delete process.env.PHONEPE_KEY_INDEX;
    if (saved.salt === undefined) delete process.env.PHONEPE_SALT_INDEX;
  });

  it('accepts only the correct callback checksum', () => {
    const response = Buffer.from('{"code":"PAYMENT_SUCCESS"}').toString('base64');
    const good = createHash('sha256').update(response + SALT).digest('hex') + '###1';
    expect(isValidCallbackChecksum(response, good)).toBe(true);
    expect(isValidCallbackChecksum(response, good.replace(/^./, 'x'))).toBe(false);
    expect(isValidCallbackChecksum(response, good.replace('###1', '###2'))).toBe(false);
    expect(isValidCallbackChecksum(response, null)).toBe(false);
    expect(isValidCallbackChecksum(response, '')).toBe(false);
  });

  it('maps payment instruments', () => {
    expect(paymentDetailsFrom({ type: 'UPI', payerVpa: 'a@ok', utr: 'U1' }, 'T1')).toEqual({ paymentReference: 'T1', paymentMethod: 'UPI', maskedPaymentId: 'a@ok', utrNumber: 'U1' });
    expect(paymentDetailsFrom({ type: 'CARD', cardType: 'CREDIT_CARD', maskedCardNumber: 'XX12', brn: 'B', cardNetwork: 'VISA' }, 'T2'))
      .toEqual(expect.objectContaining({ paymentMethod: 'CREDIT_CARD', maskedPaymentId: 'XX12', brnNumber: 'B', cardNetwork: 'VISA' }));
    expect(paymentDetailsFrom(undefined, null)).toEqual({ paymentReference: null, paymentMethod: 'PhonePe', utrNumber: null });
  });
});

describe('confirmPayment', () => {
  const order = (overrides: Record<string, unknown> = {}) => ({ id: 'order_1', userId: 'u1', discountCode: null, status: 'payment_pending', totalAmount: 21500, ...overrides });

  beforeEach(() => {
    p.order.findUnique.mockResolvedValue({ id: 'order_1', userId: 'u1', discountCode: null, user: { email: 'a@x.com' }, items: [], shippingAddress: null });
    p.cart.findFirst.mockResolvedValue({ id: 'cart_1' });
  });

  it('confirms when the paid amount matches, then clears the cart and emails once', async () => {
    p.order.findFirst.mockResolvedValue(order());
    p.order.updateMany.mockResolvedValue({ count: 1 });
    expect(await confirmPayment('TXN1', 2150000, { paymentMethod: 'UPI' }, 'callback')).toBe('confirmed');
    expect(p.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order_1', status: { in: ['payment_pending', 'payment_failed'] } },
      data: { status: 'confirmed', paymentMethod: 'UPI' },
    });
    expect(p.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart_1' } });
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
    expect(sendAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'order-confirmed' }));
  });

  it('clears only the cart rows the order was created from', async () => {
    p.order.findFirst.mockResolvedValue(order());
    p.order.updateMany.mockResolvedValue({ count: 1 });
    p.order.findUnique.mockResolvedValue({ id: 'order_1', userId: 'u1', user: null, items: [{ cartItemId: 'ci1' }, { cartItemId: 'ci2' }], shippingAddress: null });
    await confirmPayment('TXN1', 2150000, {}, 'callback');
    expect(p.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 'cart_1', id: { in: ['ci1', 'ci2'] } } });
  });

  it('records the coupon redemption in the confirmation transaction', async () => {
    p.order.findFirst.mockResolvedValue(order({ discountCode: 'SAVE5' }));
    p.order.updateMany.mockResolvedValue({ count: 1 });
    p.discount.findFirst.mockResolvedValue({ id: 'd1', maxUsesPerUser: 1, firstOrderOnly: false });
    p.discountUsage.findFirst.mockResolvedValue(null);
    p.discountUsage.count.mockResolvedValue(0);
    expect(await confirmPayment('TXN1', 2150000, {}, 'callback')).toBe('confirmed');
    expect(p.$transaction).toHaveBeenCalled();
    expect(p.discountUsage.create).toHaveBeenCalledWith({ data: { discountId: 'd1', userId: 'u1', orderId: 'order_1' } });
    expect(sendAdminNotification).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'payment-review' }));
  });

  it('confirms but flags a coupon used beyond its limit by parallel unpaid orders', async () => {
    p.order.findFirst.mockResolvedValue(order({ discountCode: 'SAVE5' }));
    p.order.updateMany.mockResolvedValue({ count: 1 });
    p.discount.findFirst.mockResolvedValue({ id: 'd1', maxUsesPerUser: 1, firstOrderOnly: false });
    p.discountUsage.findFirst.mockResolvedValue(null);
    p.discountUsage.count.mockResolvedValue(1); // already redeemed by another order
    expect(await confirmPayment('TXN1', 2150000, {}, 'callback')).toBe('confirmed');
    expect(sendAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment-review' }));
  });

  it('flags a first-order coupon on a later order', async () => {
    p.order.findFirst.mockResolvedValue(order({ discountCode: 'WELCOME' }));
    p.order.updateMany.mockResolvedValue({ count: 1 });
    p.discount.findFirst.mockResolvedValue({ id: 'd2', maxUsesPerUser: null, firstOrderOnly: true });
    p.discountUsage.findFirst.mockResolvedValue(null);
    p.order.count.mockResolvedValue(1);
    await confirmPayment('TXN1', 2150000, {}, 'callback');
    expect(p.order.count).toHaveBeenCalledWith({ where: expect.objectContaining({ userId: 'u1', id: { not: 'order_1' } }) });
    expect(sendAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment-review' }));
  });

  it('refuses an amount that does not match the order total and alerts admins', async () => {
    p.order.findFirst.mockResolvedValue(order());
    expect(await confirmPayment('TXN1', 100, {}, 'callback')).toBe('amount_mismatch');
    expect(p.order.updateMany).not.toHaveBeenCalled();
    expect(sendAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment-review' }));
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('does nothing for an already paid order', async () => {
    p.order.findFirst.mockResolvedValue(order({ status: 'confirmed' }));
    expect(await confirmPayment('TXN1', 2150000, {}, 'status-check')).toBe('already_confirmed');
    expect(p.order.updateMany).not.toHaveBeenCalled();
  });

  it('lets only one concurrent caller run the side effects', async () => {
    p.order.findFirst.mockResolvedValue(order());
    p.order.updateMany.mockResolvedValue({ count: 0 }); // another caller won
    expect(await confirmPayment('TXN1', 2150000, {}, 'status-check')).toBe('already_confirmed');
    expect(p.cartItem.deleteMany).not.toHaveBeenCalled();
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });

  it('ignores cancelled orders and unknown transactions', async () => {
    p.order.findFirst.mockResolvedValue(order({ status: 'cancelled' }));
    expect(await confirmPayment('TXN1', 2150000, {}, 'callback')).toBe('not_payable');
    p.order.findFirst.mockResolvedValue(null);
    expect(await confirmPayment('TXN9', 2150000, {}, 'callback')).toBe('not_found');
  });
});

describe('failPayment', () => {
  it('only fails unpaid orders', async () => {
    p.order.updateMany.mockResolvedValue({ count: 1 });
    expect(await failPayment('TXN1')).toBe(true);
    expect(p.order.updateMany).toHaveBeenCalledWith({ where: { transactionId: 'TXN1', status: 'payment_pending' }, data: { status: 'payment_failed' } });
    p.order.updateMany.mockResolvedValue({ count: 0 });
    expect(await failPayment('TXN1')).toBe(false);
  });
});
