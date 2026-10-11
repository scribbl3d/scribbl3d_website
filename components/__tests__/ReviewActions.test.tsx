import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReviewActions, ReviewStatusBadge, type AdminReviewInfo } from '@/app/ops/control/orders/components/ReviewActions';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/components/ui/use-toast', () => ({ toast: jest.fn() }));

const info = (overrides: Partial<AdminReviewInfo> = {}): AdminReviewInfo => ({
  status: 'not_shared', canShare: true, emailSentAt: null, firstSharedAt: null, lastSharedAt: null, shareCount: 0, ...overrides,
});

beforeEach(() => {
  jest.mocked(toast).mockClear();
  (global.fetch as jest.Mock) = jest.fn();
});

describe('ReviewStatusBadge', () => {
  it.each([
    ['not_shared', 'Not shared'],
    ['shared', 'Link shared'],
    ['partial', 'Partially reviewed'],
    ['reviewed', 'Reviewed'],
    ['expired', 'Link expired'],
    ['not_eligible', 'Not eligible'],
  ] as const)('labels %s', (status, label) => {
    render(<ReviewStatusBadge info={info({ status })} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('ReviewActions', () => {
  it.each([
    [info(), 'Share link', false],
    [info({ status: 'shared', shareCount: 1 }), 'Share again', true],
    [info({ status: 'shared', emailSentAt: '2026-10-01T00:00:00Z' }), 'Share again', true],
    [info({ status: 'partial', shareCount: 1 }), 'Share again', true],
  ])('shows the right buttons', (value, label, details) => {
    render(<ReviewActions orderId="order_1" info={value} onChanged={jest.fn()} />);
    expect(screen.getByRole('button', { name: label })).toBeEnabled();
    expect(!!screen.queryByRole('button', { name: 'Review details' })).toBe(details);
  });

  it('shows a disabled Reviewed button once everything is reviewed', () => {
    render(<ReviewActions orderId="order_1" info={info({ status: 'reviewed', canShare: false })} onChanged={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Reviewed' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Review details' })).toBeInTheDocument();
  });

  it('hides the share button for expired or ineligible orders', () => {
    render(<ReviewActions orderId="order_1" info={info({ status: 'expired', canShare: false })} onChanged={jest.fn()} />);
    expect(screen.queryByRole('button', { name: /Share/ })).not.toBeInTheDocument();
  });

  it('shares, opens the message dialog and copies the message', async () => {
    const onChanged = jest.fn();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://x/review/t', message: 'Hi Asha, ... https://x/review/t', info: info({ status: 'shared', shareCount: 1 }) }),
    });

    render(<ReviewActions orderId="order_1" info={info()} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole('button', { name: 'Share link' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Share message')).toHaveValue('Hi Asha, ... https://x/review/t');
    expect(onChanged).toHaveBeenCalledWith(expect.objectContaining({ status: 'shared' }));
    expect((global.fetch as jest.Mock).mock.calls[0]).toEqual([
      '/api/admin/reviews/share',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ orderId: 'order_1' }) }),
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Copy message' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Hi Asha, ... https://x/review/t'));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Message copied' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the dialog open when copying fails', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('denied')) } });
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ url: 'u', message: 'msg', info: info({ status: 'shared', shareCount: 1 }) }) });
    render(<ReviewActions orderId="order_1" info={info()} onChanged={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Share link' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Copy message' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Copy failed' })));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows an error toast when sharing fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ error: "This order's review link cannot be shared." }) });
    render(<ReviewActions orderId="order_1" info={info()} onChanged={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Share link' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens review details with history and reviews', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        info: info({ status: 'partial', shareCount: 2 }),
        orderReview: { rating: 5, content: 'Packed well', tags: ['Fast delivery'], status: 'PENDING', isIncentivised: false, createdAt: '2026-10-05T00:00:00Z' },
        productReviews: [],
      }),
    });
    render(<ReviewActions orderId="order_1" info={info({ status: 'partial', shareCount: 2 })} onChanged={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review details' }));
    expect(await screen.findByText('Packed well')).toBeInTheDocument();
    expect(screen.getByText('2 times')).toBeInTheDocument();
    expect(screen.getByText('No product reviews yet.')).toBeInTheDocument();
  });
});
