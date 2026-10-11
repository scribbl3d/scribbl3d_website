/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import {
  getReviewModerationCounts,
  listReviewsForModeration,
  moderateReview,
} from '@/lib/reviews/moderation';

jest.mock('@/lib/prisma', () => {
  const model = () => ({ findMany: jest.fn(), count: jest.fn(), update: jest.fn() });
  return { prisma: { orderReview: model(), productReview: model() } };
});

const orderModel = prisma.orderReview as unknown as Record<string, jest.Mock>;
const productModel = prisma.productReview as unknown as Record<string, jest.Mock>;

const base = { content: null, tags: [], reviewerName: 'Asha Rao', status: 'PENDING', isIncentivised: false, moderatedAt: null };
const orderRow = (id: string, createdAt: string, rating = 5) => ({ id, orderId: 'clorderAAAA1111', rating, createdAt: new Date(createdAt), ...base });
const productRow = (id: string, createdAt: string, index = 0, rating = 4) => ({
  id, orderId: 'clorderBBBB2222', orderItemIndex: index, itemType: 'filament', variantLabel: 'Red', rating,
  createdAt: new Date(createdAt), order: { items: [{ name: 'PETG Red' }, { name: 'PETG Blue' }] }, ...base,
});

beforeEach(() => {
  [orderModel, productModel].forEach((m) => Object.values(m).forEach((fn) => fn.mockReset()));
  orderModel.count.mockResolvedValue(0);
  productModel.count.mockResolvedValue(0);
  orderModel.findMany.mockResolvedValue([]);
  productModel.findMany.mockResolvedValue([]);
});

describe('listReviewsForModeration', () => {
  it('merges order and product reviews newest first with product names from the order', async () => {
    orderModel.findMany.mockResolvedValue([orderRow('o1', '2026-10-03')]);
    productModel.findMany.mockResolvedValue([productRow('p1', '2026-10-05', 1), productRow('p2', '2026-10-01')]);
    orderModel.count.mockResolvedValue(1);
    productModel.count.mockResolvedValue(2);

    const result = await listReviewsForModeration({ status: 'PENDING' });
    expect(result.total).toBe(3);
    expect(result.reviews.map((r) => r.id)).toEqual(['p1', 'o1', 'p2']);
    expect(result.reviews[0]).toEqual(expect.objectContaining({ kind: 'product', productName: 'PETG Blue', orderNumber: 'BBBB2222' }));
    expect(result.reviews[1]).toEqual(expect.objectContaining({ kind: 'order', productName: null }));
  });

  it('falls back to the linked product name when the order snapshot has none', async () => {
    productModel.findMany.mockResolvedValue([{ ...productRow('p9', '2026-10-05', 901), prebuiltProduct: { name: 'Tall Ghost Figurine' } }]);
    productModel.count.mockResolvedValue(1);
    const result = await listReviewsForModeration({ kind: 'product' });
    expect(result.reviews[0].productName).toBe('Tall Ghost Figurine');
  });

  it('applies status and low-rating filters to both kinds', async () => {
    await listReviewsForModeration({ status: 'APPROVED', rating: 'low' });
    const where = { status: 'APPROVED', rating: { lte: 2 } };
    expect(orderModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ where }));
    expect(productModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ where }));
  });

  it('skips the other kind and ignores status for ALL', async () => {
    await listReviewsForModeration({ status: 'ALL', kind: 'order', rating: 3 });
    expect(orderModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { rating: 3 } }));
    expect(productModel.findMany).not.toHaveBeenCalled();
  });

  it('pages through the merged list', async () => {
    const rows = Array.from({ length: 25 }, (_, i) => productRow(`p${i}`, new Date(Date.UTC(2026, 9, 1, 0, i)).toISOString()));
    productModel.findMany.mockResolvedValue(rows);
    productModel.count.mockResolvedValue(25);
    const second = await listReviewsForModeration({ kind: 'product', page: 2 });
    expect(productModel.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 40 }));
    expect(second.reviews).toHaveLength(5);
    expect(second.reviews[0].id).toBe('p4');
  });
});

describe('moderateReview', () => {
  const now = new Date('2026-10-10T00:00:00Z');

  it('approves and hides without touching customer text', async () => {
    productModel.update.mockResolvedValue({ id: 'p1', status: 'APPROVED' });
    await moderateReview('product', 'p1', 'approve', now);
    expect(productModel.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'p1' }, data: { status: 'APPROVED', moderatedAt: now } }));

    orderModel.update.mockResolvedValue({ id: 'o1', status: 'HIDDEN' });
    await moderateReview('order', 'o1', 'hide', now);
    expect(orderModel.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'o1' }, data: { status: 'HIDDEN', moderatedAt: now } }));
  });

  it('returns null for a missing review', async () => {
    productModel.update.mockRejectedValue(Object.assign(new Error('missing'), { code: 'P2025' }));
    expect(await moderateReview('product', 'gone', 'hide')).toBeNull();
  });
});

describe('getReviewModerationCounts', () => {
  it('counts pending and pending low-rated reviews across both kinds', async () => {
    orderModel.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    productModel.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    expect(await getReviewModerationCounts()).toEqual({ pending: 7, lowRating: 3 });
    expect(productModel.count).toHaveBeenCalledWith({ where: { status: 'PENDING', rating: { lte: 2 } } });
  });
});
