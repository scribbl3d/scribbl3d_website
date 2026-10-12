/**
 * @jest-environment node
 */
import { getServerSession } from 'next-auth';
import { POST } from '@/app/api/create-order/route';
import { prisma } from '@/lib/prisma';
import { CheckoutPricingError, priceCheckoutWithItems } from '@/lib/checkout/pricing';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data }) },
}));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('@/lib/checkout/pricing', () => {
  const actual = jest.requireActual('@/lib/checkout/pricing');
  return { ...actual, priceCheckoutWithItems: jest.fn() };
});
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

const p = prisma as any;
const pricedItems = [
  { id: 'ci1', sourceId: 'pr1', itemType: 'printer', name: 'Printer', price: 20000, quantity: 1, images: ['p.jpg'] },
  { id: 'ci2', sourceId: 'fil1', variantId: 'fv1', itemType: 'filament', name: 'PLA', price: 1000, quantity: 2, images: [], size: '1.75mm - 1kg', color: 'Red' },
];
const serverPricing = { subtotal: 22000, discountAmount: 500, discountCode: 'SAVE5', tax: 3280, shippingPrice: 0, totalAmount: 21500 };

const body = (overrides: Record<string, unknown> = {}) => ({
  mode: 'cart', shippingMode: 'Surface', totalAmount: 21500, transactionId: 'TXN1717171717abcdef', discountCode: 'SAVE5',
  shippingAddress: { pincode: '560001' }, billingAddress: {}, paymentMethod: 'PhonePe',
  // values a tampered browser might send; all ignored
  subtotal: 1, tax: 0, shippingPrice: 0, discountAmount: 21499, items: [{ price: 1 }],
  ...overrides,
});
const request = (b: unknown) => ({ json: async () => b }) as unknown as Request;

beforeEach(() => {
  jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'owner' } } as any);
  p.order.findUnique.mockReset().mockResolvedValue(null);
  p.order.create.mockReset().mockResolvedValue({ id: 'order_1', status: 'payment_pending' });
  jest.mocked(priceCheckoutWithItems).mockReset().mockResolvedValue({ pricing: serverPricing, items: pricedItems } as any);
});

describe('create-order pricing', () => {
  it('stores only server-calculated amounts', async () => {
    const res = await POST(request(body()));
    expect(res.status).toBe(200);
    expect(priceCheckoutWithItems).toHaveBeenCalledWith({ userId: 'owner', shippingMode: 'Surface', destinationPincode: '560001', discountCode: 'SAVE5' });
    expect(p.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        subtotal: 22000, discountAmount: 500, discountCode: 'SAVE5', tax: 3280, shippingPrice: 0, totalAmount: 21500, status: 'payment_pending',
      }),
    });
  });

  it('stores the snapshot from exactly the items that were priced', async () => {
    await POST(request(body()));
    expect(p.order.create.mock.calls[0][0].data.items).toEqual([
      { itemType: 'printer', productId: 'pr1', cartItemId: 'ci1', name: 'Printer', quantity: 1, price: 20000, image: 'p.jpg' },
      { itemType: 'filament', productId: 'fil1', cartItemId: 'ci2', variantId: 'fv1', name: 'PLA', quantity: 2, price: 1000, image: null, size: '1.75mm - 1kg', color: 'Red' },
    ]);
  });

  it('returns the up-to-date prices when the shown total differs', async () => {
    const res = await POST(request(body({ totalAmount: 1 })));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(expect.objectContaining({ code: 'PRICE_CHANGED', pricing: serverPricing }));
    expect(p.order.create).not.toHaveBeenCalled();
  });

  it('returns pricing errors (e.g. a coupon for someone else) as 400', async () => {
    jest.mocked(priceCheckoutWithItems).mockRejectedValue(new CheckoutPricingError('This coupon is not valid for your account', 'DISCOUNT_INVALID'));
    const res = await POST(request(body()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'This coupon is not valid for your account', code: 'DISCOUNT_INVALID' });
  });

  it.each([
    ['buy-now', { mode: 'buynow' }],
    ['a bad shipping mode', { shippingMode: 'Teleport' }],
    ['a bad transaction ID', { transactionId: 'x' }],
    ['a missing address', { shippingAddress: null }],
    ['a missing total', { totalAmount: undefined }],
  ])('rejects %s', async (_label, overrides) => {
    expect((await POST(request(body(overrides)))).status).toBe(400);
    expect(p.order.create).not.toHaveBeenCalled();
  });

  it("does not return another customer's order for a reused transaction ID", async () => {
    p.order.findUnique.mockResolvedValue({ id: 'theirs', userId: 'someone_else', status: 'payment_pending' });
    expect((await POST(request(body()))).status).toBe(409);
  });

  it('is idempotent for the same customer', async () => {
    p.order.findUnique.mockResolvedValue({ id: 'mine', userId: 'owner', status: 'payment_pending' });
    expect(await (await POST(request(body()))).json()).toEqual({ orderId: 'mine', status: 'payment_pending' });
    expect(priceCheckoutWithItems).not.toHaveBeenCalled();
  });
});
