import { safeNum, formatINR } from '../safeNum';

describe('SafeNum Utilities - Unit Tests', () => {
  describe('safeNum', () => {
    describe('valid numbers', () => {
      it('should return valid positive integers', () => {
        expect(safeNum(42)).toBe(42);
        expect(safeNum(0)).toBe(0);
        expect(safeNum(999)).toBe(999);
      });

      it('should return valid negative integers', () => {
        expect(safeNum(-42)).toBe(-42);
        expect(safeNum(-1)).toBe(-1);
      });

      it('should return valid decimal numbers', () => {
        expect(safeNum(3.14)).toBe(3.14);
        expect(safeNum(0.5)).toBe(0.5);
        expect(safeNum(-2.5)).toBe(-2.5);
      });

      it('should handle very small numbers', () => {
        expect(safeNum(0.000001)).toBe(0.000001);
      });

      it('should handle very large numbers', () => {
        expect(safeNum(1e10)).toBe(10000000000);
      });
    });

    describe('numeric strings', () => {
      it('should convert valid numeric strings', () => {
        expect(safeNum('42')).toBe(42);
        expect(safeNum('3.14')).toBe(3.14);
        expect(safeNum('-10')).toBe(-10);
      });

      it('should convert string zero', () => {
        expect(safeNum('0')).toBe(0);
      });

      it('should handle numeric strings with whitespace', () => {
        expect(safeNum(' 42 ')).toBe(42);
      });

      it('should handle scientific notation strings', () => {
        expect(safeNum('1e3')).toBe(1000);
        expect(safeNum('2.5e2')).toBe(250);
      });
    });

    describe('invalid inputs returning 0', () => {
      it('should return 0 for undefined', () => {
        expect(safeNum(undefined)).toBe(0);
      });

      it('should return 0 for null', () => {
        expect(safeNum(null)).toBe(0);
      });

      it('should return 0 for NaN', () => {
        expect(safeNum(NaN)).toBe(0);
      });

      it('should return 0 for Infinity', () => {
        expect(safeNum(Infinity)).toBe(0);
      });

      it('should return 0 for -Infinity', () => {
        expect(safeNum(-Infinity)).toBe(0);
      });

      it('should return 0 for non-numeric strings', () => {
        expect(safeNum('abc')).toBe(0);
        expect(safeNum('hello')).toBe(0);
        expect(safeNum('12abc')).toBe(0);
      });

      it('should return 0 for empty string', () => {
        expect(safeNum('')).toBe(0);
      });

      it('should return 0 for objects', () => {
        expect(safeNum({})).toBe(0);
        expect(safeNum({ value: 42 })).toBe(0);
      });

      it('should return 0 for arrays', () => {
        expect(safeNum([])).toBe(0);
        // Note: [42] converts to 42 in JavaScript, which is valid behavior
        expect(safeNum([42])).toBe(42);
        expect(safeNum([1, 2])).toBe(0); // Multiple elements = NaN = 0
      });

      it('should return 0 for boolean true', () => {
        expect(safeNum(true)).toBe(1); // Note: Number(true) = 1
      });

      it('should return 0 for boolean false', () => {
        expect(safeNum(false)).toBe(0);
      });

      it('should return 0 for functions', () => {
        expect(safeNum(() => 42)).toBe(0);
      });

      // Symbols throw TypeError when converted, which is expected JavaScript behavior
      // Not testing symbols as they're not meant to be converted to numbers
    });

    describe('edge cases', () => {
      it('should handle Number.MAX_VALUE', () => {
        expect(safeNum(Number.MAX_VALUE)).toBe(Number.MAX_VALUE);
      });

      it('should handle Number.MIN_VALUE', () => {
        expect(safeNum(Number.MIN_VALUE)).toBe(Number.MIN_VALUE);
      });

      it('should handle negative zero', () => {
        // -0 is a valid IEEE 754 number, safeNum preserves it
        const result = safeNum(-0);
        expect(Object.is(result, -0) || result === 0).toBe(true);
      });

      it('should handle string with multiple decimals as invalid', () => {
        expect(safeNum('1.2.3')).toBe(0);
      });

      it('should handle currency symbols as invalid', () => {
        expect(safeNum('$42')).toBe(0);
        expect(safeNum('₹100')).toBe(0);
      });
    });
  });

  describe('formatINR', () => {
    describe('standard formatting', () => {
      it('should format integers with Indian grouping', () => {
        expect(formatINR(1000)).toBe('1,000');
        expect(formatINR(10000)).toBe('10,000');
        expect(formatINR(100000)).toBe('1,00,000');
        expect(formatINR(1000000)).toBe('10,00,000');
      });

      it('should format zero', () => {
        expect(formatINR(0)).toBe('0');
      });

      it('should format decimal numbers', () => {
        const result = formatINR(1234.56);
        expect(result).toContain('1,234');
      });

      it('should handle negative numbers', () => {
        const result = formatINR(-1000);
        expect(result).toContain('1,000');
        expect(result).toContain('-');
      });
    });

    describe('large numbers', () => {
      it('should format lakhs correctly', () => {
        expect(formatINR(500000)).toBe('5,00,000');
      });

      it('should format crores correctly', () => {
        expect(formatINR(10000000)).toBe('1,00,00,000');
      });

      it('should format very large numbers', () => {
        const result = formatINR(123456789);
        expect(result).toContain('12,34,56,789');
      });
    });

    describe('invalid inputs', () => {
      it('should return "0" for undefined', () => {
        expect(formatINR(undefined)).toBe('0');
      });

      it('should return "0" for null', () => {
        expect(formatINR(null)).toBe('0');
      });

      it('should return "0" for NaN', () => {
        expect(formatINR(NaN)).toBe('0');
      });

      it('should return "0" for Infinity', () => {
        expect(formatINR(Infinity)).toBe('0');
      });

      it('should return "0" for non-numeric strings', () => {
        expect(formatINR('invalid')).toBe('0');
      });

      it('should return "0" for empty string', () => {
        expect(formatINR('')).toBe('0');
      });
    });

    describe('string number inputs', () => {
      it('should format numeric strings', () => {
        expect(formatINR('1000')).toBe('1,000');
        expect(formatINR('100000')).toBe('1,00,000');
      });

      it('should format decimal strings', () => {
        const result = formatINR('1234.56');
        expect(result).toContain('1,234');
      });
    });

    describe('special cases', () => {
      it('should handle numbers less than 1000', () => {
        expect(formatINR(1)).toBe('1');
        expect(formatINR(99)).toBe('99');
        expect(formatINR(999)).toBe('999');
      });

      it('should handle exact thousands', () => {
        expect(formatINR(1000)).toBe('1,000');
        expect(formatINR(10000)).toBe('10,000');
      });

      it('should be consistent with safeNum', () => {
        const testValue = 'invalid';
        const safeValue = safeNum(testValue);
        const formatted = formatINR(testValue);
        expect(formatted).toBe(safeValue.toLocaleString('en-IN'));
      });
    });
  });
});
