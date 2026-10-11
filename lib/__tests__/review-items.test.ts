/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { createReviewToken } from '@/lib/reviews/link';
import { loadReviewLink } from '@/lib/reviews/reviewableItems';

jest.mock('@/lib/prisma', () => {
  const model = () => ({ findUnique: jest.fn(), findMany: jest.fn() });
  return {
    prisma: {
      order: { findUnique: jest.fn() },
      printer: model(),
      filament: model(),
      resin: model(),
      prebuiltProducts: model(),
    },
  };
});

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-12-15T00:00:00Z');
const orderId = 'clorder123';
const token = () => createReviewToken(orderId);

const order = (overrides: Record<string, unknown> = {}) => ({
  id: orderId,
  userId: 'user_1',
  status: 'delivered',
  refundStatus: null,
  refundId: null,
  deliveredAt: new Date(now.getTime() - 5 * DAY),
  items: [{ itemType: 'printer', productId: 'printer_1', name: 'Bambu A1', quantity: 1 }],
  shippingAddress: { fullName: 'Asha Rao' },
  user: { name: 'Asha Rao' },
  reviews: [],
  orderReview: null,
  ...overrides,
});

const mocked = prisma as unknown as Record<string, Record<string, jest.Mock>>;

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.REVIEW_LAUNCH_AT = '2026-11-01T00:00:00Z';
  Object.values(mocked).forEach((m) => Object.values(m).forEach((fn) => fn.mockReset()));
  mocked.printer.findUnique.mockResolvedValue({ id: 'printer_1' });
});

describe('loadReviewLink', () => {
  it('rejects an invalid token without touching the database', async () => {
    expect(await loadReviewLink('bad.token', now)).toEqual({ state: 'invalid' });
    expect(mocked.order.findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ['missing order', null],
    ['not delivered', order({ status: 'shipped' })],
    ['refunded', order({ refundStatus: 'completed' })],
    ['refund started', order({ refundId: 'RFD_1' })],
  ])('marks %s as ineligible', async (_label, value) => {
    mocked.order.findUnique.mockResolvedValue(value);
    expect((await loadReviewLink(token(), now)).state).toBe('ineligible');
  });

  it('expires post-launch orders after 30 days', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ deliveredAt: new Date(now.getTime() - 31 * DAY) }));
    expect((await loadReviewLink(token(), now)).state).toBe('expired');
  });

  it('keeps pre-launch orders open', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ deliveredAt: new Date('2026-06-20T00:00:00Z') }));
    expect((await loadReviewLink(token(), now)).state).toBe('open');
  });

  it('reports completed only when the order and every item are reviewed', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ reviews: [{ orderItemIndex: 0 }], orderReview: { id: 'or_1' } }));
    expect((await loadReviewLink(token(), now)).state).toBe('completed');
  });

  it('stays open for the order-level review when all items are reviewed', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ reviews: [{ orderItemIndex: 0 }] }));
    const result = await loadReviewLink(token(), now);
    expect(result.state === 'open' && result.orderReviewed).toBe(false);
  });

  it('stays open for products when the order-level review is done', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ orderReview: { id: 'or_1' } }));
    const result = await loadReviewLink(token(), now);
    expect(result.state === 'open' && result.orderReviewed).toBe(true);
  });

  it('returns reviewable items with variant label and reviewer name', async () => {
    mocked.order.findUnique.mockResolvedValue(
      order({
        items: [
          { itemType: 'printer', productId: 'printer_1', name: 'Bambu A1', quantity: 1 },
          { itemType: 'filament', name: 'PLA Silk Gold', color: 'Gold', size: '1.75mm - 1kg', quantity: 2 },
        ],
        reviews: [{ orderItemIndex: 0 }],
      }),
    );
    mocked.filament.findMany.mockResolvedValue([{ id: 'fil_1' }]);

    const result = await loadReviewLink(token(), now);
    expect(result.state).toBe('open');
    if (result.state !== 'open') return;
    expect(result.reviewerName).toBe('Asha Rao');
    expect(result.orderNumber).toBe(orderId.slice(-8).toUpperCase());
    expect(result.items).toEqual([
      expect.objectContaining({ index: 0, productId: 'printer_1', reviewed: true }),
      expect.objectContaining({ index: 1, itemType: 'filament', productId: 'fil_1', variantLabel: 'Gold · 1.75mm - 1kg', quantity: 2, reviewed: false }),
    ]);
    expect(result.items[1]).not.toHaveProperty('tags');
    expect(mocked.filament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: { equals: 'PLA Silk Gold', mode: 'insensitive' },
          colorName: { equals: 'Gold', mode: 'insensitive' },
        },
      }),
    );
  });

  it('hides unmatched, ambiguous, deleted and unsupported items (R8)', async () => {
    mocked.order.findUnique.mockResolvedValue(
      order({
        items: [
          { itemType: 'printer', productId: 'printer_1', name: 'Bambu A1' },
          { itemType: 'resin', name: 'Renamed resin' },
          { itemType: 'prebuilt', name: 'Duplicate name' },
          { itemType: 'printer', productId: 'deleted', name: 'Old printer' },
          { itemType: 'unknown', name: 'Mystery' },
        ],
      }),
    );
    mocked.printer.findUnique.mockImplementation(({ where }: any) => Promise.resolve(where.id === 'printer_1' ? { id: 'printer_1' } : null));
    mocked.resin.findMany.mockResolvedValue([]);
    mocked.prebuiltProducts.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

    const result = await loadReviewLink(token(), now);
    expect(result.state === 'open' && result.items.map((i) => i.index)).toEqual([0]);
  });

  it('still allows the order-level review when no item can be matched', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ items: [{ itemType: 'resin', name: 'Gone' }] }));
    mocked.resin.findMany.mockResolvedValue([]);
    const result = await loadReviewLink(token(), now);
    expect(result.state === 'open' && result.items).toEqual([]);
  });

  it('falls back to the address name, then a generic label', async () => {
    mocked.order.findUnique.mockResolvedValue(order({ user: { name: null }, shippingAddress: { name: 'R. Iyer' } }));
    const first = await loadReviewLink(token(), now);
    expect(first.state === 'open' && first.reviewerName).toBe('R. Iyer');

    mocked.order.findUnique.mockResolvedValue(order({ user: { name: '  ' }, shippingAddress: '{}' }));
    const second = await loadReviewLink(token(), now);
    expect(second.state === 'open' && second.reviewerName).toBe('Verified buyer');
  });
});
