import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MyCoupons from '@/app/profile/_components/my-coupons';

const coupon = (overrides: Record<string, unknown> = {}) => ({
  code: 'REVABCD2345', value: 5, valueType: 'percentage' as const, maxDiscount: 500,
  expiresAt: '2026-10-25T00:00:00.000Z', status: 'active' as const, orderNumber: '12345678', issuedAt: '2026-10-10T00:00:00.000Z',
  ...overrides,
});

describe('MyCoupons', () => {
  it('shows an empty state', () => {
    render(<MyCoupons coupons={[]} />);
    expect(screen.getByText("You don't have any coupons yet.")).toBeInTheDocument();
  });

  it('shows active coupons with value, source order, expiry and actions', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<MyCoupons coupons={[coupon()]} />);
    expect(screen.getByText('REVABCD2345')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('5% off, up to ₹500 on your whole cart')).toBeInTheDocument();
    expect(screen.getByText(/For reviewing order #12345678/)).toBeInTheDocument();
    expect(screen.getByText(/Expires 25 Oct 2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Use in cart' })).toHaveAttribute('href', '/cart?coupon=REVABCD2345');
    fireEvent.click(screen.getByRole('button', { name: 'Copy coupon code REVABCD2345' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('REVABCD2345'));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });

  it.each([
    ['used', 'Used'],
    ['expired', 'Expired'],
    ['cancelled', 'Cancelled'],
  ] as const)('shows %s coupons without actions', (status, label) => {
    render(<MyCoupons coupons={[coupon({ status })]} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Use in cart' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copy/ })).not.toBeInTheDocument();
  });
});
