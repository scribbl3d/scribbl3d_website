import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FilamentHero from '@/components/filaments/FilamentHero';
import PrebuiltProductDetailClient from '@/app/prebuilt-products/[slug]/_components/PrebuiltProductDetailClient';
import { toast } from '@/components/ui/use-toast';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }), signIn: jest.fn() }));
jest.mock('@/providers/CartProvider', () => ({ useCart: () => ({ addToCart: jest.fn() }) }));
jest.mock('@/components/ui/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/components/shared/PdpImage', () => ({ PdpImage: () => null }));
jest.mock('@/components/shared/NotifyMeModal', () => ({ NotifyMeModal: () => null }));
jest.mock('@/app/profile/_components/wishlist-modal', () => ({
  __esModule: true,
  default: ({ item }: { item: { title: string } }) => <div role="dialog" aria-label={`Select variants for ${item.title}`} />,
}));
jest.mock('framer-motion', () => ({
  motion: {
    h2: ({ children, className }: { children: ReactNode; className?: string }) => <h2 className={className}>{children}</h2>,
    p: ({ children, className }: { children: ReactNode; className?: string }) => <p className={className}>{children}</p>,
    span: ({ children, className }: { children: ReactNode; className?: string }) => <span className={className}>{children}</span>,
  },
}));

const variants = ['Small', 'Medium', 'Large'].map((size) => ({ id: `variant-${size}`, sizeName: size, colorName: 'Blue', colorHex: '#0000ff', price: 100, originalPrice: 120, isActive: true, inStock: true }));
const product = { id: 'main-product', slug: 'main-product', name: 'Main Product', category: 'Decor', images: [], reviews: [], attributes: [], features: [], variants, inStock: true, isCustomizable: false };
const similar = { ...product, id: 'similar-product', slug: 'similar-product', name: 'Similar Product' };

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe('Filament hero', () => {
  it('renders repeated headline words with unique keys and retains material selection', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => ({ ok: true, json: async () => url.includes('page-hero') ? { mediaUrl: '/logo.webp', mediaType: 'image', headline: 'Print Print Better', subtext: 'Materials for printing' } : { materials: ['PETG', 'PLA+', 'ABS'] } }));
    const onMaterialSelect = jest.fn();
    render(<FilamentHero animate={false} onMaterialSelect={onMaterialSelect} />);
    await waitFor(() => expect(screen.getAllByText('Print')).toHaveLength(2));
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['PLA+', 'ABS', 'PETG']);
    fireEvent.click(screen.getByRole('button', { name: 'PETG' }));
    expect(onMaterialSelect).toHaveBeenCalledWith('PETG');
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/same key|unique.*key/i);
    errors.mockRestore();
  });
});

describe('Similar product card interactions', () => {
  it('provides native focusable product links without nesting the wishlist button', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ products: [similar] }) });
    render(<PrebuiltProductDetailClient product={product} />);
    const links = await screen.findAllByRole('link', { name: 'View Similar Product' });
    expect(links).toHaveLength(2);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/prebuilt-products/similar-product');
      expect(link.querySelector('button')).toBeNull();
    });
    links[0].focus();
    expect(links[0]).toHaveFocus();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add to wishlist: Similar Product' })[0]);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Authentication required' }));
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getAllByText('Small, Medium & more')).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Select Variants' })[0]);
    expect(screen.getByRole('dialog', { name: 'Select variants for Similar Product' })).toBeInTheDocument();
  });

  it('does not create a broken product link when the slug is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ products: [{ ...similar, slug: null }] }) });
    render(<PrebuiltProductDetailClient product={product} />);
    await screen.findAllByRole('button', { name: 'Add to wishlist: Similar Product' });
    expect(screen.queryByRole('link', { name: 'View Similar Product' })).not.toBeInTheDocument();
  });
});
