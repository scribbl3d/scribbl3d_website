/**
 * @jest-environment node
 */
import { prisma } from '@/lib/prisma';
import { getCustomerOrderReviewTestimonials, initialsFor, mergeHomepageTestimonials } from '@/lib/reviews/homepageReviews';

jest.mock('@/lib/prisma', () => ({ prisma: { orderReview: { findMany: jest.fn() } } }));
const p = prisma as any;

describe('homepage customer reviews', () => {
  it('uses approved overall-experience reviews with text, newest first', async () => {
    p.orderReview.findMany.mockResolvedValue([
      { id: 'r2', content: '  Fast and well packed  ', reviewerName: 'Riya Gupta', rating: 4, isIncentivised: true },
      { id: 'r1', content: '   ', reviewerName: 'No Text', rating: 5, isIncentivised: false },
      { id: 'r0', content: 'Great support', reviewerName: 'asha', rating: 5, isIncentivised: false },
    ]);
    expect(await getCustomerOrderReviewTestimonials()).toEqual([
      { id: 'review-r2', quote: 'Fast and well packed', name: 'Riya Gupta', role: 'Verified customer', initials: 'RG', rating: 4 },
      { id: 'review-r0', quote: 'Great support', name: 'asha', role: 'Verified customer', initials: 'AS', rating: 5 },
    ]);
    expect(p.orderReview.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'APPROVED', content: { not: null } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 20,
    }));
  });

  it('puts customer reviews before the managed testimonials', () => {
    const customer = [{ id: 'review-1', quote: 'a', name: 'A', role: 'Verified buyer', initials: 'A', rating: 5 }];
    const managed = [{ id: 'm1', quote: 'b', name: 'B', role: 'Google review', initials: 'B', rating: 5 }];
    expect(mergeHomepageTestimonials(customer, managed).map((t) => t.id)).toEqual(['review-1', 'm1']);
  });

  it('makes initials', () => {
    expect(initialsFor('Riya Gupta')).toBe('RG');
    expect(initialsFor('Anand Kumar Rao')).toBe('AR');
    expect(initialsFor('Verified buyer')).toBe('VB');
    expect(initialsFor('')).toBe('?');
  });
});
