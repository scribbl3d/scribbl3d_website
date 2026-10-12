/**
 * @jest-environment node
 */
import { getServerSession } from 'next-auth/next';
import { POST } from '@/app/api/cart/route';
import { loadCartItems } from '@/lib/cart/loadCartItems';
import { prisma } from '@/lib/prisma';

jest.mock('next/server', () => ({
  NextResponse: { json: (data: unknown, options: { status?: number } = {}) => ({ status: options.status || 200, json: async () => data, headers: new Map() }) },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/options', () => ({ authOptions: {} }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    prebuiltVariants: { findFirst: jest.fn() },
    printer: { findUnique: jest.fn() },
    resin: { findUnique: jest.fn() },
    resinWeight: { findFirst: jest.fn(), findUnique: jest.fn() },
    resinColour: { findFirst: jest.fn(), findUnique: jest.fn() },
    filamentVariant: { findFirst: jest.fn(), findUnique: jest.fn() },
    cart: { findFirst: jest.fn(), create: jest.fn() },
    cartItem: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}));

const p = prisma as any;
const req = (body: unknown) => ({ json: async () => body }) as unknown as Request;

beforeEach(() => {
  Object.values(p).forEach((m: any) => Object.values(m).forEach((fn: any) => fn.mockReset()));
  jest.mocked(getServerSession).mockResolvedValue({ user: { id: 'u1' } } as any);
  p.cart.findFirst.mockResolvedValue({ id: 'cart_1' });
  p.cartItem.findFirst.mockResolvedValue(null);
  p.printer.findUnique.mockResolvedValue({ inStock: true });
});

describe('POST /api/cart', () => {
  it.each([0, -1, 1.5, 'abc', 1000, null])('rejects quantity %p', async (quantity) => {
    expect((await POST(req({ printerId: 'pr1', quantity }))).status).toBe(400);
    expect(p.cartItem.create).not.toHaveBeenCalled();
  });

  it('rejects a line naming two product families', async () => {
    expect((await POST(req({ printerId: 'pr1', resinId: 'r1' }))).status).toBe(400);
  });

  it('rejects an out-of-stock printer', async () => {
    p.printer.findUnique.mockResolvedValue({ inStock: false });
    expect((await POST(req({ printerId: 'pr1' }))).status).toBe(400);
    expect(p.cartItem.create).not.toHaveBeenCalled();
  });

  it("rejects a resin weight/colour that belongs to another resin", async () => {
    p.resin.findUnique.mockResolvedValue({ inStock: true });
    p.resinWeight.findFirst.mockResolvedValue(null); // not this resin's weight
    p.resinColour.findFirst.mockResolvedValue({ inStock: true });
    expect((await POST(req({ resinId: 'r1', resinWeightId: 'w_other', resinColourId: 'c1' }))).status).toBe(400);
    expect(p.resinWeight.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'w_other', resinId: 'r1' } }));
  });

  it('rejects an out-of-stock prebuilt variant or product', async () => {
    p.prebuiltVariants.findFirst.mockResolvedValue({ id: 'v1', inStock: true, prebuiltProduct: { inStock: false } });
    expect((await POST(req({ prebuiltProductId: 'pb1', prebuiltVariantId: 'v1' }))).status).toBe(400);
  });

  it('adds a valid line', async () => {
    expect((await POST(req({ printerId: 'pr1', quantity: 2 }))).status).toBe(200);
    expect(p.cartItem.create).toHaveBeenCalledWith({ data: expect.objectContaining({ printerId: 'pr1', quantity: 2 }) });
  });
});

describe('loadCartItems', () => {
  const cartWith = (item: Record<string, unknown>) => p.cart.findFirst.mockResolvedValue({ items: [{ id: 'ci1', quantity: 1, ...item }] });

  it('orphans a resin line whose weight belongs to another resin', async () => {
    cartWith({
      resinId: 'r1', resinWeightId: 'w2', resinColourId: 'c1',
      resin: { id: 'r1', name: 'Premium', inStock: true }, resinWeight: null, resinColour: null,
    });
    p.resinWeight.findUnique.mockResolvedValue({ id: 'w2', resinId: 'r_cheap', price: 100, weightInGrams: 500, inStock: true });
    p.resinColour.findUnique.mockResolvedValue({ id: 'c1', resinId: 'r1', name: 'Grey', images: [], inStock: true });
    const [line] = await loadCartItems('u1');
    expect(line).toEqual(expect.objectContaining({ _orphaned: true, price: 0, inStock: false }));
  });

  it('orphans a filament line whose variant belongs to another filament', async () => {
    cartWith({ filamentId: 'f1', filamentVariantId: 'fv2', filament: { id: 'f1', name: 'Silk', inStock: true }, filamentVariant: null });
    p.filamentVariant.findUnique.mockResolvedValue({ id: 'fv2', filamentId: 'f_other', price: 10, inStock: true });
    const [line] = await loadCartItems('u1');
    expect(line).toEqual(expect.objectContaining({ _orphaned: true, price: 0, inStock: false }));
  });

  it('marks out-of-stock printers and inactive prebuilt variants unavailable', async () => {
    cartWith({ printerId: 'pr1', printer: { id: 'pr1', name: 'P', price: 20000, inStock: false, images: [], specifications: [] } });
    expect((await loadCartItems('u1'))[0]).toEqual(expect.objectContaining({ inStock: false }));

    cartWith({
      prebuiltProductId: 'pb1', prebuiltVariantId: 'v1',
      prebuiltProduct: { id: 'pb1', name: 'Vase', inStock: true, images: [] },
      prebuiltVariant: { id: 'v1', prebuildProductId: 'pb1', price: 500, isActive: false, inStock: true },
    });
    expect((await loadCartItems('u1'))[0]).toEqual(expect.objectContaining({ inStock: false, variantId: 'v1' }));
  });
});

describe('loadCartItems with deleted products', () => {
  it('marks a line whose product was deleted (relation set to null) unavailable', async () => {
    p.cart.findFirst.mockResolvedValue({ items: [{ id: 'ci1', quantity: 1, printerId: null, printer: null }] });
    expect((await loadCartItems('u1'))[0]).toEqual(expect.objectContaining({ itemType: 'unknown', price: 0, inStock: false }));
  });
});
