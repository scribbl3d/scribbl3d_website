import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminReviewsPage from '@/app/ops/control/reviews/page';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/components/ui/use-toast', () => ({ toast: jest.fn() }));

const review = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1', kind: 'product', orderId: 'o', orderNumber: 'ABCD1234', productName: 'PETG Red', itemType: 'filament',
  variantLabel: 'Red · 1kg', rating: 5, content: 'Great spool', tags: ['Smooth extrusion'], reviewerName: 'Asha Rao',
  status: 'PENDING', isIncentivised: false, createdAt: '2026-10-05T00:00:00Z', moderatedAt: null, ...overrides,
});

const counts = { pending: 3, approved: 7, hidden: 1, all: 11, lowRatingPending: 2 };
const listResponse = (reviews: unknown[]) => ({ ok: true, json: async () => ({ reviews, total: reviews.length, pageSize: 20, counts }) });

beforeEach(() => {
  jest.mocked(toast).mockClear();
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue(listResponse([review(), review({ id: 'o1', kind: 'order', productName: null, variantLabel: null, rating: 1, content: null, status: 'HIDDEN' })]));
});

describe('Admin reviews page', () => {
  it('opens on all reviews and shows details, low-rating flag and actions', async () => {
    render(<AdminReviewsPage />);
    expect(await screen.findByText('Great spool')).toBeInTheDocument();
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/admin/reviews?status=ALL&kind=all&rating=all&page=1');
    expect(screen.getAllByText('Asha Rao')).toHaveLength(2);
    expect(screen.getAllByText(/Order #ABCD1234/)).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute('href', '/ops/control');
    expect(screen.getByText('Low rating')).toBeInTheDocument();
    expect(screen.getByText('No written review.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show again' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete|edit/i })).not.toBeInTheDocument();
  });

  it('shows status counts and jumps to pending low ratings', async () => {
    render(<AdminReviewsPage />);
    await screen.findByText('Great spool');
    expect(screen.getByRole('tab', { name: /Approved\s*7/ })).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent?.replace(/\d+/g, '').trim());
    expect(tabs).toEqual(['All', 'Pending', 'Approved', 'Hidden']);
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2 low ratings to review' }));
    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.at(-1)[0]).toBe('/api/admin/reviews?status=PENDING&kind=all&rating=low&page=1'),
    );
  });

  it('refetches with filters', async () => {
    render(<AdminReviewsPage />);
    await screen.findByText('Great spool');
    fireEvent.click(screen.getByRole('tab', { name: /^Approved/ }));
    fireEvent.change(screen.getByLabelText('Rating'), { target: { value: 'low' } });
    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.at(-1)[0]).toBe('/api/admin/reviews?status=APPROVED&kind=all&rating=low&page=1'),
    );
  });

  it('approves a review and reloads', async () => {
    render(<AdminReviewsPage />);
    await screen.findByText('Great spool');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith({ title: 'Review approved' }));
    const patch = (global.fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/admin/reviews/moderate');
    expect(JSON.parse(patch[1].body)).toEqual({ kind: 'product', id: 'p1', action: 'approve' });
  });

  it('hides the low-ratings line when there are none', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ reviews: [review()], total: 1, pageSize: 20, counts: { ...counts, lowRatingPending: 0 } }) });
    render(<AdminReviewsPage />);
    await screen.findByText('Great spool');
    expect(screen.queryByText(/low ratings? to review/)).not.toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(listResponse([]));
    render(<AdminReviewsPage />);
    expect(await screen.findByText('No reviews match these filters.')).toBeInTheDocument();
  });
});
