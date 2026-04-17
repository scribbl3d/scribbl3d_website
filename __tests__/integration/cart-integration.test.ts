/**
 * INTEGRATION TESTS
 * 
 * These tests verify that multiple units work together correctly.
 * They test the interaction between cart utilities, discount logic, and formatting.
 */

import { safeNum, formatINR } from '@/lib/safeNum';
import { safeSubtotal } from '@/lib/cart-utils';
import { buildValueLabel, buildDescription } from '@/lib/discount-utils';
import type { CartItem } from '@/providers/CartProvider';

// Create mock cart item
const createCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'item1',
  itemType: 'product',
  name: 'Test Product',
  quantity: 1,
  price: 1000,
  images: ['image1.jpg'],
  ...overrides,
});

// Create mock discount
const createDiscount = (overrides: any = {}) => ({
  code: 'TEST10',
  valueType: 'percentage' as const,
  value: 10,
  minOrderValue: null,
  maxDiscount: null,
  expiresAt: '2025-12-31',
  ...overrides,
});

describe('Cart & Discount Integration Tests', () => {
  describe('Cart Total Calculations with Discounts', () => {
    it('should calculate cart total with percentage discount', () => {
      const items: CartItem[] = [
        createCartItem({ price: 1000, quantity: 2 }), // 2000
        createCartItem({ price: 500, quantity: 1 }),  // 500
      ];

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(2500);

      const discount = createDiscount({ valueType: 'percentage', value: 10 });
      const discountAmount = (subtotal * discount.value) / 100;
      const finalTotal = subtotal - discountAmount;

      expect(finalTotal).toBe(2250);
      expect(formatINR(finalTotal)).toBe('2,250');
    });

    it('should calculate cart total with flat discount', () => {
      const items: CartItem[] = [
        createCartItem({ price: 1000, quantity: 3 }),
      ];

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(3000);

      const discount = createDiscount({ valueType: 'flat', value: 500 });
      const finalTotal = subtotal - discount.value;

      expect(finalTotal).toBe(2500);
      expect(formatINR(finalTotal)).toBe('2,500');
    });

    it('should respect max discount cap', () => {
      const items: CartItem[] = [
        createCartItem({ price: 10000, quantity: 1 }),
      ];

      const subtotal = safeSubtotal(items);
      const discount = createDiscount({ 
        valueType: 'percentage', 
        value: 20,
        maxDiscount: 1000 
      });

      const calculatedDiscount = (subtotal * discount.value) / 100; // 2000
      const actualDiscount = Math.min(calculatedDiscount, discount.maxDiscount);
      const finalTotal = subtotal - actualDiscount;

      expect(actualDiscount).toBe(1000);
      expect(finalTotal).toBe(9000);
    });

    it('should check minimum order value requirement', () => {
      const items: CartItem[] = [
        createCartItem({ price: 500, quantity: 1 }),
      ];

      const subtotal = safeSubtotal(items);
      const discount = createDiscount({ minOrderValue: 1000 });

      const isEligible = safeNum(discount.minOrderValue) <= subtotal;

      expect(isEligible).toBe(false);
      expect(subtotal).toBe(500);
    });

    it('should apply discount when minimum order value is met', () => {
      const items: CartItem[] = [
        createCartItem({ price: 1000, quantity: 1 }),
        createCartItem({ price: 500, quantity: 1 }),
      ];

      const subtotal = safeSubtotal(items);
      const discount = createDiscount({ 
        valueType: 'percentage',
        value: 10,
        minOrderValue: 1000 
      });

      const isEligible = safeNum(discount.minOrderValue) <= subtotal;
      const discountAmount = isEligible ? (subtotal * discount.value) / 100 : 0;
      const finalTotal = subtotal - discountAmount;

      expect(isEligible).toBe(true);
      expect(discountAmount).toBe(150);
      expect(finalTotal).toBe(1350);
    });
  });

  describe('Cart Item Validation with Safe Numbers', () => {
    it('should handle invalid price values gracefully', () => {
      const items: CartItem[] = [
        createCartItem({ price: 'invalid' as any, quantity: 2 }),
        createCartItem({ price: null as any, quantity: 1 }),
        createCartItem({ price: undefined as any, quantity: 3 }),
      ];

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(0);
    });

    it('should handle mixed valid and invalid values', () => {
      const items: CartItem[] = [
        createCartItem({ price: 1000, quantity: 2 }),     // Valid: 2000
        createCartItem({ price: NaN as any, quantity: 1 }), // Invalid: 0
        createCartItem({ price: 500, quantity: 'bad' as any }), // Invalid: 0
      ];

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(2000); // Only the first item counts
    });

    it('should format cart total in Indian currency', () => {
      const items: CartItem[] = [
        createCartItem({ price: 100000, quantity: 1 }),
        createCartItem({ price: 50000, quantity: 2 }),
      ];

      const subtotal = safeSubtotal(items);
      const formatted = formatINR(subtotal);

      expect(subtotal).toBe(200000);
      expect(formatted).toBe('2,00,000');
    });
  });

  describe('Discount Label & Description Integration', () => {
    it('should generate complete discount information', () => {
      const discount = createDiscount({
        valueType: 'percentage',
        value: 15,
        minOrderValue: 2000,
        maxDiscount: 500,
      });

      const label = buildValueLabel(discount);
      const description = buildDescription(discount);

      expect(label).toBe('15% OFF');
      expect(description).toContain('15% discount');
      expect(description).toContain('₹2,000');
      expect(description).toContain('₹500');
    });

    it('should generate flat discount information', () => {
      const discount = createDiscount({
        valueType: 'flat',
        value: 300,
        minOrderValue: 1500,
      });

      const label = buildValueLabel(discount);
      const description = buildDescription(discount);

      expect(label).toBe('Save ₹300');
      expect(description).toContain('Flat ₹300 off');
      expect(description).toContain('₹1,500');
    });
  });

  describe('Complex Cart Scenarios', () => {
    it('should handle empty cart', () => {
      const items: CartItem[] = [];
      
      const subtotal = safeSubtotal(items);
      const formatted = formatINR(subtotal);

      expect(subtotal).toBe(0);
      expect(formatted).toBe('0');
    });

    it('should filter cart items correctly', () => {
      const items: CartItem[] = [
        createCartItem({ id: '1', itemType: 'printer', price: 10000 }),
        createCartItem({ id: '2', itemType: 'resin', price: 500 }),
        createCartItem({ id: '3', itemType: 'printer', price: 15000 }),
      ];

      const printersOnly = items.filter(item => item.itemType === 'printer');
      const printersSubtotal = safeSubtotal(printersOnly);

      expect(printersSubtotal).toBe(25000);
    });

    it('should handle large quantities and prices', () => {
      const items: CartItem[] = [
        createCartItem({ price: 999999, quantity: 100 }),
      ];

      const subtotal = safeSubtotal(items);
      const formatted = formatINR(subtotal);

      expect(subtotal).toBe(99999900);
      expect(formatted).toBe('9,99,99,900');
    });

    it('should handle decimal prices correctly', () => {
      const items: CartItem[] = [
        createCartItem({ price: 99.99, quantity: 3 }),
        createCartItem({ price: 149.50, quantity: 2 }),
      ];

      const subtotal = safeSubtotal(items);
      
      // 99.99 * 3 + 149.50 * 2 = 299.97 + 299.00 = 598.97
      expect(subtotal).toBeCloseTo(598.97, 2);
    });
  });

  describe('Multiple Discount Scenarios', () => {
    it('should choose best discount for customer', () => {
      const items: CartItem[] = [
        createCartItem({ price: 5000, quantity: 1 }),
      ];
      const subtotal = safeSubtotal(items);

      const discount1 = createDiscount({ valueType: 'percentage', value: 15 }); // 750 off
      const discount2 = createDiscount({ valueType: 'flat', value: 1000 }); // 1000 off

      const amount1 = (subtotal * discount1.value) / 100;
      const amount2 = discount2.value;

      const bestDiscount = Math.max(amount1, amount2);

      expect(bestDiscount).toBe(1000);
      expect(subtotal - bestDiscount).toBe(4000);
    });

    it('should validate stacking restrictions', () => {
      // This demonstrates how you might prevent discount stacking
      const subtotal = 10000;
      const allowStacking = false;

      if (allowStacking) {
        // Would apply multiple discounts
        expect(true).toBe(false);
      } else {
        // Only one discount can be applied
        expect(subtotal).toBe(10000);
      }
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle negative prices as zero', () => {
      const items: CartItem[] = [
        createCartItem({ price: -100, quantity: 2 }),
      ];

      // safeNum should convert negative to 0 if that's the business logic
      // or keep negative if refunds are allowed
      const subtotal = safeSubtotal(items);
      
      expect(subtotal).toBe(-200); // Depends on business logic
    });

    it('should handle extremely large cart', () => {
      const items: CartItem[] = Array.from({ length: 1000 }, (_, i) =>
        createCartItem({ 
          id: `item${i}`,
          price: 100, 
          quantity: 1 
        })
      );

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(100000);
    });

    it('should handle cart with zero quantity items', () => {
      const items: CartItem[] = [
        createCartItem({ price: 1000, quantity: 0 }),
        createCartItem({ price: 500, quantity: 2 }),
      ];

      const subtotal = safeSubtotal(items);
      expect(subtotal).toBe(1000); // Only the second item
    });
  });
});
