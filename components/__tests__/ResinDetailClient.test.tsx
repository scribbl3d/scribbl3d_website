import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResinDetailClient from '@/app/resins/[slug]/_components/ResinDetailClient';

const mockAddToCart = jest.fn();
let mockSession: { user: { id: string } } | null = null;
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: mockSession }), signIn: jest.fn() }));
jest.mock('@/providers/CartProvider', () => ({ useCart: () => ({ addToCart: mockAddToCart }) }));
jest.mock('@/components/ui/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/components/resins/SimilarResinsCarousel', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/shared/PdpImage', () => ({ PdpImage: () => null }));
jest.mock('@/components/shared/NotifyMeModal', () => ({
  NotifyMeModal: ({ isOpen, productId, variantId, variantLabel }: Readonly<{ isOpen: boolean; productId: string; variantId?: string; variantLabel?: string }>) => isOpen ? <div role="dialog" aria-label="Stock notification" data-product-id={productId} data-variant-id={variantId || ''} data-variant-label={variantLabel || ''} /> : null,
}));

function makeResin() {
  return {
    id: 'resin-1', name: 'Test Resin', brand: 'Test Brand', technology: 'LCD', inStock: true,
    resolution: ['4K', '12K'], description: 'Test resin description', shortDescription: 'For test prints',
    specifications: [], features: [], applications: [], compatibilities: [], downloads: [],
    attributes: [{ label: 'Temperature', value: '80' }, { label: 'Pressure', value: '0.45' }],
    colours: [
      { id: 'grey', name: 'Grey', hexCode: '#888888', inStock: true, images: [{ id: 'front', url: '/logo.webp', altText: 'Front' }, { id: 'back', url: '/logo.webp', altText: 'Back' }] },
      { id: 'blue', name: 'Blue', hexCode: '#0000ff', inStock: true, images: [] },
    ],
    weights: [
      { id: 'one-kg', weightInGrams: 1000, inStock: true, price: 1000, originalPrice: 1200, discount: 17 },
      { id: 'two-kg', weightInGrams: 2000, inStock: true, price: 1800, originalPrice: 2000, discount: 10 },
    ],
  };
}

beforeEach(() => {
  mockSession = null;
  mockAddToCart.mockReset().mockResolvedValue(undefined);
  (global.fetch as jest.Mock).mockReset().mockResolvedValue({ ok: true, json: async () => ({ isInWishlist: false }) });
});

describe('Resin detail behaviour', () => {
  it.each(['product', 'colour', 'weight'])('preserves %s out-of-stock precedence and notification target', (level) => {
    const resin = makeResin();
    resin.weights[0].inStock = false;
    if (level !== 'weight') resin.colours[0].inStock = false;
    if (level === 'product') resin.inStock = false;
    render(<ResinDetailClient resin={resin} />);
    expect(screen.queryByRole('button', { name: 'Add to Cart' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 kg' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Notify Me When Back in Stock/ }));
    const dialog = screen.getByRole('dialog', { name: 'Stock notification' });
    expect(dialog).toHaveAttribute('data-product-id', 'resin-1');
    const targets = { product: ['', ''], colour: ['grey', 'Grey'], weight: ['one-kg', '1000g'] };
    const [id, label] = targets[level as keyof typeof targets];
    expect(dialog).toHaveAttribute('data-variant-id', id);
    expect(dialog).toHaveAttribute('data-variant-label', label);
  });

  it('preserves pack-size pricing, colour resets, quantity, and cart payloads', async () => {
    mockSession = { user: { id: 'test-user' } };
    render(<ResinDetailClient resin={makeResin()} />);
    expect(screen.getByText('12K Resolution Ready')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2 kg' }));
    expect(screen.getByRole('button', { name: '2 kg' })).toHaveClass('border-blue-600');
    expect(screen.getByText('₹1,800')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    await waitFor(() => expect(mockAddToCart).toHaveBeenCalledWith({ resinId: 'resin-1', resinColourId: 'grey', resinWeightId: 'two-kg', quantity: 2 }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled());
    fireEvent.click(screen.getByTitle('Blue'));
    expect(screen.getByRole('button', { name: '1 kg' })).toHaveClass('border-blue-600');
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    await waitFor(() => expect(mockAddToCart).toHaveBeenLastCalledWith({ resinId: 'resin-1', resinColourId: 'blue', resinWeightId: 'one-kg', quantity: 2 }));
  });

  it('keeps cart submission disabled while loading', async () => {
    mockSession = { user: { id: 'test-user' } };
    let finish!: () => void;
    mockAddToCart.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<ResinDetailClient resin={makeResin()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
    await act(async () => finish());
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeEnabled();
  });

  it.each([
    { attributes: [{ label: 'Temperature', value: '80' }, { label: 'Pressure', value: '0.45' }], expected: '80°C @ 0.45 MPa' },
    { attributes: [{ label: 'Temperature', value: '80' }], expected: '80°C' },
    { attributes: [{ label: 'Pressure', value: '0.45' }], expected: '0.45 MPa' },
    { attributes: [], expected: null },
  ])('preserves heat deflection formatting %#', ({ attributes, expected }) => {
    render(<ResinDetailClient resin={{ ...makeResin(), attributes }} />);
    if (expected) expect(screen.getByText(expected)).toBeInTheDocument();
    else expect(screen.queryByText('Heat Deflection Temp')).not.toBeInTheDocument();
  });

  it('keeps gallery arrow components mounted while changing slides', () => {
    const { container } = render(<ResinDetailClient resin={makeResin()} />);
    const nextButton = screen.getByRole('button', { name: 'Next image' });
    const arrow = nextButton.querySelector('svg');
    fireEvent.click(nextButton);
    expect(container.querySelector('[style*="translateX"]')).toHaveStyle({ transform: 'translateX(-100%)' });
    expect(screen.getByRole('button', { name: 'Next image' }).querySelector('svg')).toBe(arrow);
  });
});
