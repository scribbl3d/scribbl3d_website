import { safeNum, formatINR, safeLineTotal, safeSubtotal } from '../cart-utils';
import type { CartItem } from '@/providers/CartProvider';

describe('cart-utils', () => {
  describe('safeNum', () => {
    it('should return 0 for undefined', () => {
      expect(safeNum(undefined)).toBe(0);
    });

    it('should return 0 for null', () => {
      expect(safeNum(null)).toBe(0);
    });

    it('should return 0 for NaN', () => {
      expect(safeNum(NaN)).toBe(0);
    });

    it('should return 0 for non-numeric strings', () => {
      expect(safeNum('abc')).toBe(0);
    });

    it('should return 0 for Infinity', () => {
      expect(safeNum(Infinity)).toBe(0);
    });

    it('should return 0 for -Infinity', () => {
      expect(safeNum(-Infinity)).toBe(0);
    });

    it('should return the number for valid numeric input', () => {
      expect(safeNum(42)).toBe(42);
    });

    it('should return the number for numeric strings', () => {
      expect(safeNum('42')).toBe(42);
    });

    it('should return the number for negative values', () => {
      expect(safeNum(-42)).toBe(-42);
    });

    it('should return the number for decimal values', () => {
      expect(safeNum(42.5)).toBe(42.5);
    });

    it('should return 0 for empty string', () => {
      expect(safeNum('')).toBe(0);
    });

    it('should return 0 for objects', () => {
      expect(safeNum({})).toBe(0);
    });

    it('should return 0 for arrays', () => {
      expect(safeNum([])).toBe(0);
    });
  });

  describe('formatINR', () => {
    it('should format valid numbers with Indian locale', () => {
      expect(formatINR(1000)).toBe('1,000');
    });

    it('should format large numbers correctly', () => {
      expect(formatINR(100000)).toBe('1,00,000');
    });

    it('should format million correctly', () => {
      expect(formatINR(1000000)).toBe('10,00,000');
    });

    it('should format zero', () => {
      expect(formatINR(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatINR(-1000)).toBe('-1,000');
    });

    it('should handle decimal numbers', () => {
      const result = formatINR(1234.56);
      expect(result).toContain('1,234');
    });

    it('should return "0" for NaN', () => {
      expect(formatINR(NaN)).toBe('0');
    });

    it('should return "0" for undefined', () => {
      expect(formatINR(undefined)).toBe('0');
    });

    it('should return "0" for null', () => {
      expect(formatINR(null)).toBe('0');
    });

    it('should return "0" for non-numeric strings', () => {
      expect(formatINR('invalid')).toBe('0');
    });
  });

  describe('safeLineTotal', () => {
    it('should calculate correct line total', () => {
      const item = { price: 100, quantity: 3 };
      expect(safeLineTotal(item)).toBe(300);
    });

    it('should handle zero price', () => {
      const item = { price: 0, quantity: 5 };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle zero quantity', () => {
      const item = { price: 100, quantity: 0 };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle undefined price', () => {
      const item = { price: undefined, quantity: 5 };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle undefined quantity', () => {
      const item = { price: 100, quantity: undefined };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle both undefined', () => {
      const item = { price: undefined, quantity: undefined };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle decimal values', () => {
      const item = { price: 10.5, quantity: 2 };
      expect(safeLineTotal(item)).toBe(21);
    });

    it('should handle string numbers', () => {
      const item = { price: '100', quantity: '3' };
      expect(safeLineTotal(item)).toBe(300);
    });

    it('should handle NaN values', () => {
      const item = { price: NaN, quantity: 3 };
      expect(safeLineTotal(item)).toBe(0);
    });

    it('should handle negative values', () => {
      const item = { price: -100, quantity: 3 };
      expect(safeLineTotal(item)).toBe(-300);
    });
  });

  describe('safeSubtotal', () => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Item 1',
        price: 100,
        quantity: 2,
        images: ['/image1.jpg'],
        itemType: 'product',
      },
      {
        id: '2',
        name: 'Item 2',
        price: 50,
        quantity: 3,
        images: ['/image2.jpg'],
        itemType: 'product',
      },
      {
        id: '3',
        name: 'Item 3',
        price: 75,
        quantity: 1,
        images: ['/image3.jpg'],
        itemType: 'resin',
      },
    ];

    it('should calculate total for all items without filter', () => {
      expect(safeSubtotal(mockCartItems)).toBe(425);
    });

    it('should calculate total for empty array', () => {
      expect(safeSubtotal([])).toBe(0);
    });

    it('should filter items and calculate subtotal', () => {
      const filterFn = (item: CartItem) => item.itemType === 'product';
      expect(safeSubtotal(mockCartItems, filterFn)).toBe(350);
    });

    it('should filter items by quantity > 1', () => {
      const filterFn = (item: CartItem) => item.quantity > 1;
      expect(safeSubtotal(mockCartItems, filterFn)).toBe(350);
    });

    it('should return 0 when filter matches no items', () => {
      const filterFn = (item: CartItem) => item.itemType === 'printer';
      expect(safeSubtotal(mockCartItems, filterFn)).toBe(0);
    });

    it('should handle items with undefined price', () => {
      const itemsWithUndefined: CartItem[] = [
        {
          id: '1',
          name: 'Item 1',
          price: undefined as any,
          quantity: 2,
          images: ['/image1.jpg'],
          itemType: 'product',
        },
        {
          id: '2',
          name: 'Item 2',
          price: 100,
          quantity: 1,
          images: ['/image2.jpg'],
          itemType: 'product',
        },
      ];
      expect(safeSubtotal(itemsWithUndefined)).toBe(100);
    });

    it('should handle items with undefined quantity', () => {
      const itemsWithUndefined: CartItem[] = [
        {
          id: '1',
          name: 'Item 1',
          price: 100,
          quantity: undefined as any,
          images: ['/image1.jpg'],
          itemType: 'product',
        },
        {
          id: '2',
          name: 'Item 2',
          price: 50,
          quantity: 2,
          images: ['/image2.jpg'],
          itemType: 'product',
        },
      ];
      expect(safeSubtotal(itemsWithUndefined)).toBe(100);
    });

    it('should handle complex filter function', () => {
      const filterFn = (item: CartItem) => {
        return item.price > 50 && item.quantity > 1;
      };
      expect(safeSubtotal(mockCartItems, filterFn)).toBe(200);
    });
  });
});
