/**
 * @jest-environment node
 */
import { loadCartItems } from '@/lib/cart/loadCartItems';
import { prisma } from '@/lib/prisma';
import { validateDiscountEligibility } from '@/app/cart/utils/validateDiscountEligibility';
import { CheckoutPricingError, gstIncluded, priceCheckout } from '@/lib/checkout/pricing';
import { prepareExpressShippingItems, resolveUnitWeightKg } from '@/app/checkout/components/expressShipping';

jest.mock('@/lib/cart/loadCartItems', () => ({ loadCartItems: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { discount: { findFirst: jest.fn() } } }));
jest.mock('@/app/cart/utils/validateDiscountEligibility', () => ({ validateDiscountEligibility: jest.fn() }));
jest.mock('@/lib/shipping/delhiveryQuote', () => ({ getDelhiveryCharge: jest.fn(), chargeAmount: jest.fn() }));

const p = prisma as any;
const item = (overrides: Record<string, unknown> = {}) => ({
  id: 'ci1', itemType: 'printer', name: 'Printer', price: 20000, quantity: 1, images: [], inStock: true, ...overrides,
});
const coupon = { id: 'd1', code: 'SAVE5', scope: 'cart', valueType: 'percentage', value: 5, maxDiscount: 500, minOrderValue: null, isActive: true, expiresAt: null, itemTypes: [] };

beforeEach(() => {
  jest.mocked(loadCartItems).mockReset().mockResolvedValue([item(), item({ id: 'ci2', itemType: 'filament', price: 1000, quantity: 2, size: '1.75mm - 1kg' })] as any);
  p.discount.findFirst.mockReset().mockResolvedValue(coupon);
  jest.mocked(validateDiscountEligibility).mockReset().mockResolvedValue({ eligible: true });
});

const price = (overrides: Record<string, unknown> = {}) =>
  priceCheckout({ userId: 'u1', shippingMode: 'Surface', destinationPincode: '560001', discountCode: null, ...overrides } as any);

describe('gstIncluded', () => {
  it('pulls 18% GST out of an inclusive amount, rounded', () => {
    expect(gstIncluded(1180)).toBe(180);
    expect(gstIncluded(21500)).toBe(3280); // 21500 - 21500/1.18 = 3279.66
    expect(gstIncluded(-5)).toBe(0);
  });
});

describe('priceCheckout', () => {
  it('prices a Surface order from server data (free shipping, GST after discount)', async () => {
    expect(await price({ discountCode: 'save5' })).toEqual({
      subtotal: 22000, discountAmount: 500, discountCode: 'SAVE5', tax: 3280, shippingPrice: 0, totalAmount: 21500,
    });
    expect(validateDiscountEligibility).toHaveBeenCalledWith('d1', 'u1');
    expect(p.discount.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ code: 'SAVE5' }) }));
  });

  it('adds the server Express quote', async () => {
    const quoter = jest.fn().mockResolvedValue(150.4);
    const result = await price({ shippingMode: 'Express', quoter });
    // printer package + filament package
    expect(quoter).toHaveBeenCalledTimes(2);
    expect(result.shippingPrice).toBe(301);
    expect(result.totalAmount).toBe(22301);
    expect(quoter.mock.calls[0][2]).toBe('560001');
  });

  it.each([
    ['an empty cart', [], 'CART_EMPTY'],
    ['an orphaned item', [item({ _orphaned: true })], 'ITEM_UNAVAILABLE'],
    ['a zero-priced item', [item({ price: 0 })], 'ITEM_UNAVAILABLE'],
    ['an out-of-stock item', [item({ inStock: false })], 'ITEM_UNAVAILABLE'],
    ['an unknown item', [item({ itemType: 'unknown' })], 'ITEM_UNAVAILABLE'],
  ])('rejects %s', async (_label, cart, code) => {
    jest.mocked(loadCartItems).mockResolvedValue(cart as any);
    await expect(price()).rejects.toMatchObject({ code });
  });

  it('rejects ineligible or inapplicable discounts', async () => {
    jest.mocked(validateDiscountEligibility).mockResolvedValue({ eligible: false, reason: 'This coupon is not valid for your account' });
    await expect(price({ discountCode: 'SAVE5' })).rejects.toMatchObject({ code: 'DISCOUNT_INVALID', message: 'This coupon is not valid for your account' });

    jest.mocked(validateDiscountEligibility).mockResolvedValue({ eligible: true });
    p.discount.findFirst.mockResolvedValue({ ...coupon, minOrderValue: 100000 });
    await expect(price({ discountCode: 'SAVE5' })).rejects.toMatchObject({ code: 'DISCOUNT_INVALID' });

    p.discount.findFirst.mockResolvedValue(null);
    await expect(price({ discountCode: 'NOPE' })).rejects.toBeInstanceOf(CheckoutPricingError);
  });

  it('needs a valid pincode and a working quote for Express', async () => {
    await expect(price({ shippingMode: 'Express', destinationPincode: '12', quoter: jest.fn() })).rejects.toMatchObject({ code: 'SHIPPING_UNAVAILABLE' });
    await expect(price({ shippingMode: 'Express', quoter: jest.fn().mockRejectedValue(new Error('down')) })).rejects.toMatchObject({ code: 'SHIPPING_UNAVAILABLE' });
    await expect(price({ shippingMode: 'Express', quoter: jest.fn().mockResolvedValue(0) })).rejects.toMatchObject({ code: 'SHIPPING_UNAVAILABLE' });
  });

  it('refuses Express above the weight limit', async () => {
    jest.mocked(loadCartItems).mockResolvedValue([item({ weight: '60000', quantity: 2 })] as any);
    await expect(price({ shippingMode: 'Express', quoter: jest.fn().mockResolvedValue(100) })).rejects.toMatchObject({ code: 'EXPRESS_NOT_ALLOWED' });
  });
});

describe('Express packages', () => {
  it('parses unit weights from size labels', () => {
    expect(resolveUnitWeightKg('1000g')).toBe(1);
    expect(resolveUnitWeightKg('500g')).toBe(0.5);
    expect(resolveUnitWeightKg('1kg')).toBe(1);
    expect(resolveUnitWeightKg('1.75mm - 1kg')).toBe(1);
    expect(resolveUnitWeightKg('1.75mm - 250g')).toBe(0.25);
    expect(resolveUnitWeightKg(null)).toBe(1);
    expect(resolveUnitWeightKg('Standard')).toBe(1);
  });

  it('counts filament spool weight', () => {
    const result = prepareExpressShippingItems([{ itemType: 'filament', quantity: 3, size: '1.75mm - 1kg' }] as any);
    expect(result.totalWeightKg).toBe(3);
    expect(result.items).toEqual([expect.objectContaining({ itemType: 'filament', weight: 3000, length: 27.5 })]);
  });

  it('states the real weight limit', () => {
    const result = prepareExpressShippingItems([{ itemType: 'printer', quantity: 2, weight: '60000' }] as any);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Express shipping not allowed for orders above 100kg');
  });
});
