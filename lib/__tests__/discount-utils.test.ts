import { buildValueLabel, buildDescription, formatExpiryDate } from '../discount-utils';
import type { Discount } from '@/app/ops/control/discounts/types';

const createMockDiscount = (overrides: Partial<Discount> = {}): Discount => ({
  id: '1',
  name: 'Test Discount',
  code: 'TEST',
  scope: 'cart',
  valueType: 'flat',
  value: 100,
  minOrderValue: null,
  maxDiscount: null,
  expiresAt: null,
  isHidden: false,
  isActive: true,
  firstOrderOnly: false,
  maxUsesPerUser: null,
  itemTypes: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('discount-utils', () => {
  describe('buildValueLabel', () => {
    it('should format flat discount label', () => {
      const discount = createMockDiscount({ code: 'FLAT100', valueType: 'flat', value: 100 });
      expect(buildValueLabel(discount)).toBe('Save ₹100');
    });

    it('should format large flat discount with Indian locale', () => {
      const discount = createMockDiscount({ code: 'FLAT1000', valueType: 'flat', value: 1000 });
      expect(buildValueLabel(discount)).toBe('Save ₹1,000');
    });

    it('should format percentage discount label', () => {
      const discount = createMockDiscount({ code: 'PERCENT10', valueType: 'percentage', value: 10 });
      expect(buildValueLabel(discount)).toBe('10% OFF');
    });

    it('should handle zero value flat discount', () => {
      const discount = createMockDiscount({ code: 'ZERO', valueType: 'flat', value: 0 });
      expect(buildValueLabel(discount)).toBe('Save ₹0');
    });

    it('should handle zero value percentage discount', () => {
      const discount = createMockDiscount({ code: 'ZERO', valueType: 'percentage', value: 0 });
      expect(buildValueLabel(discount)).toBe('0% OFF');
    });

    it('should handle decimal percentage', () => {
      const discount = createMockDiscount({ code: 'PERCENT15.5', valueType: 'percentage', value: 15.5 });
      expect(buildValueLabel(discount)).toBe('15.5% OFF');
    });
  });

  describe('buildDescription', () => {
    it('should build description for flat discount without conditions', () => {
      const discount = createMockDiscount({ code: 'FLAT100', valueType: 'flat', value: 100 });
      expect(buildDescription(discount)).toBe('Flat ₹100 off.');
    });

    it('should build description for flat discount with min order value', () => {
      const discount = createMockDiscount({
        code: 'FLAT100',
        valueType: 'flat',
        value: 100,
        minOrderValue: 500,
      });
      expect(buildDescription(discount)).toBe('Flat ₹100 off. on orders above ₹500.');
    });

    it('should build description for percentage discount without conditions', () => {
      const discount = createMockDiscount({ code: 'PERCENT10', valueType: 'percentage', value: 10 });
      expect(buildDescription(discount)).toBe('10% discount.');
    });

    it('should build description for percentage discount with min order value', () => {
      const discount = createMockDiscount({
        code: 'PERCENT10',
        valueType: 'percentage',
        value: 10,
        minOrderValue: 1000,
      });
      expect(buildDescription(discount)).toBe('10% discount. on orders above ₹1,000.');
    });

    it('should build description for percentage discount with max discount', () => {
      const discount = createMockDiscount({
        code: 'PERCENT10',
        valueType: 'percentage',
        value: 10,
        maxDiscount: 200,
      });
      expect(buildDescription(discount)).toBe('10% discount. up to ₹200.');
    });

    it('should build description for percentage discount with all conditions', () => {
      const discount = createMockDiscount({
        code: 'PERCENT10',
        valueType: 'percentage',
        value: 10,
        minOrderValue: 1000,
        maxDiscount: 200,
      });
      expect(buildDescription(discount)).toBe(
        '10% discount. on orders above ₹1,000. up to ₹200.'
      );
    });

    it('should ignore maxDiscount for flat discount type', () => {
      const discount = createMockDiscount({
        code: 'FLAT100',
        valueType: 'flat',
        value: 100,
        maxDiscount: 200,
      });
      expect(buildDescription(discount)).toBe('Flat ₹100 off.');
    });

    it('should handle zero minOrderValue', () => {
      const discount = createMockDiscount({
        code: 'FLAT100',
        valueType: 'flat',
        value: 100,
        minOrderValue: 0,
      });
      expect(buildDescription(discount)).toBe('Flat ₹100 off.');
    });

    it('should handle null minOrderValue', () => {
      const discount = createMockDiscount({
        code: 'FLAT100',
        valueType: 'flat',
        value: 100,
        minOrderValue: null,
      });
      expect(buildDescription(discount)).toBe('Flat ₹100 off.');
    });

    it('should format large numbers with Indian locale', () => {
      const discount = createMockDiscount({
        code: 'PERCENT10',
        valueType: 'percentage',
        value: 10,
        minOrderValue: 100000,
        maxDiscount: 10000,
      });
      expect(buildDescription(discount)).toBe(
        '10% discount. on orders above ₹1,00,000. up to ₹10,000.'
      );
    });
  });

  describe('formatExpiryDate', () => {
    it('should format valid date string', () => {
      const date = '2024-12-31';
      const result = formatExpiryDate(date);
      expect(result).toMatch(/31.*Dec.*2024/);
    });

    it('should format ISO date string', () => {
      const date = '2024-06-15T10:30:00.000Z';
      const result = formatExpiryDate(date);
      expect(result).toMatch(/15.*Jun.*2024/);
    });

    it('should return null for null input', () => {
      expect(formatExpiryDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(formatExpiryDate(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(formatExpiryDate('')).toBeNull();
    });

    it('should handle different year formats', () => {
      const date = '2025-01-01';
      const result = formatExpiryDate(date);
      expect(result).toMatch(/1.*Jan.*2025/);
    });

    it('should handle leap year dates', () => {
      const date = '2024-02-29';
      const result = formatExpiryDate(date);
      expect(result).toMatch(/29.*Feb.*2024/);
    });

    it('should format dates with day, month abbreviation, and year', () => {
      const date = '2024-03-15';
      const result = formatExpiryDate(date);
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
      expect(result).toContain('Mar');
    });
  });
});
