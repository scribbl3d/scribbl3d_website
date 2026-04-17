import {
  cn,
  generateOTP,
  imageLoader,
  generateTransactionId,
  generatePhonePeChecksum,
  verifyPhonePeChecksum,
  formatPrice,
  formatDate,
  getPhonePeErrorMessage,
} from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('bg-red-500', 'text-white');
      expect(result).toContain('bg-red-500');
      expect(result).toContain('text-white');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'hidden-class', 'visible-class');
      expect(result).toContain('base-class');
      expect(result).toContain('visible-class');
      expect(result).not.toContain('hidden-class');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toContain('px-4');
      expect(result).toContain('py-1');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null', () => {
      const result = cn('text-sm', undefined, null, 'font-bold');
      expect(result).toContain('text-sm');
      expect(result).toContain('font-bold');
    });
  });

  describe('generateOTP', () => {
    it('should generate 6 digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).not.toBe(otp2);
    });

    it('should generate OTP within valid range', () => {
      const otp = generateOTP();
      const otpNum = parseInt(otp, 10);
      expect(otpNum).toBeGreaterThanOrEqual(100000);
      expect(otpNum).toBeLessThanOrEqual(999999);
    });

    it('should always be numeric', () => {
      for (let i = 0; i < 10; i++) {
        const otp = generateOTP();
        expect(Number.isNaN(Number(otp))).toBe(false);
      }
    });
  });

  describe('imageLoader', () => {
    it('should append width and default quality', () => {
      const result = imageLoader({
        src: '/test-image.jpg',
        width: 800,
      });
      expect(result).toBe('/test-image.jpg?w=800&q=75');
    });

    it('should use custom quality', () => {
      const result = imageLoader({
        src: '/test-image.jpg',
        width: 1200,
        quality: 90,
      });
      expect(result).toBe('/test-image.jpg?w=1200&q=90');
    });

    it('should handle URLs with existing query params', () => {
      const result = imageLoader({
        src: '/test-image.jpg?param=value',
        width: 600,
      });
      expect(result).toContain('w=600');
      expect(result).toContain('q=75');
    });

    it('should work with different widths', () => {
      const result1 = imageLoader({ src: '/img.jpg', width: 320 });
      const result2 = imageLoader({ src: '/img.jpg', width: 1920 });
      
      expect(result1).toContain('w=320');
      expect(result2).toContain('w=1920');
    });
  });

  describe('generateTransactionId', () => {
    it('should start with TXN_ prefix', () => {
      const txnId = generateTransactionId();
      expect(txnId).toMatch(/^TXN_/);
    });

    it('should contain timestamp', () => {
      const beforeTimestamp = Date.now();
      const txnId = generateTransactionId();
      const afterTimestamp = Date.now();
      
      const timestamp = parseInt(txnId.split('_')[1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should generate unique IDs', () => {
      const id1 = generateTransactionId();
      const id2 = generateTransactionId();
      expect(id1).not.toBe(id2);
    });

    it('should have correct format', () => {
      const txnId = generateTransactionId();
      const parts = txnId.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('TXN');
      expect(/^\d+$/.test(parts[1])).toBe(true);
    });

    it('should generate multiple unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateTransactionId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generatePhonePeChecksum', () => {
    it('should generate checksum with correct format', () => {
      const checksum = generatePhonePeChecksum('payload', 'saltKey', '1');
      expect(checksum).toMatch(/^[a-f0-9]+###\d+$/);
    });

    it('should include salt index', () => {
      const checksum = generatePhonePeChecksum('payload', 'saltKey', '2');
      expect(checksum).toContain('###2');
    });

    it('should generate different checksums for different payloads', () => {
      const checksum1 = generatePhonePeChecksum('payload1', 'saltKey', '1');
      const checksum2 = generatePhonePeChecksum('payload2', 'saltKey', '1');
      expect(checksum1).not.toBe(checksum2);
    });

    it('should generate same checksum for same inputs', () => {
      const checksum1 = generatePhonePeChecksum('payload', 'saltKey', '1');
      const checksum2 = generatePhonePeChecksum('payload', 'saltKey', '1');
      expect(checksum1).toBe(checksum2);
    });

    it('should be case sensitive', () => {
      const checksum1 = generatePhonePeChecksum('Payload', 'saltKey', '1');
      const checksum2 = generatePhonePeChecksum('payload', 'saltKey', '1');
      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('verifyPhonePeChecksum', () => {
    it('should verify correct checksum', () => {
      const checksum = generatePhonePeChecksum('payload', 'saltKey', '1');
      const isValid = verifyPhonePeChecksum('payload', 'saltKey', '1', checksum);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect checksum', () => {
      const isValid = verifyPhonePeChecksum('payload', 'saltKey', '1', 'invalid###1');
      expect(isValid).toBe(false);
    });

    it('should reject checksum with wrong payload', () => {
      const checksum = generatePhonePeChecksum('payload1', 'saltKey', '1');
      const isValid = verifyPhonePeChecksum('payload2', 'saltKey', '1', checksum);
      expect(isValid).toBe(false);
    });

    it('should reject checksum with wrong salt key', () => {
      const checksum = generatePhonePeChecksum('payload', 'saltKey1', '1');
      const isValid = verifyPhonePeChecksum('payload', 'saltKey2', '1', checksum);
      expect(isValid).toBe(false);
    });

    it('should reject checksum with wrong salt index', () => {
      const checksum = generatePhonePeChecksum('payload', 'saltKey', '1');
      const isValid = verifyPhonePeChecksum('payload', 'saltKey', '2', checksum);
      expect(isValid).toBe(false);
    });
  });

  describe('formatPrice', () => {
    it('should format price in Indian rupees', () => {
      const formatted = formatPrice(1000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,000');
    });

    it('should handle zero', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('0');
    });

    it('should format large amounts with Indian numbering', () => {
      const formatted = formatPrice(100000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,00,000');
    });

    it('should handle decimal amounts', () => {
      const formatted = formatPrice(99.99);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('99.99');
    });

    it('should handle negative amounts', () => {
      const formatted = formatPrice(-500);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('500');
    });
  });

  describe('formatDate', () => {
    it('should format date in Indian locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('15');
      expect(formatted).toContain('January');
      expect(formatted).toContain('2024');
    });

    it('should handle different months', () => {
      const date = new Date('2024-06-30');
      const formatted = formatDate(date);
      expect(formatted).toContain('30');
      expect(formatted).toContain('June');
      expect(formatted).toContain('2024');
    });

    it('should handle leap year', () => {
      const date = new Date('2024-02-29');
      const formatted = formatDate(date);
      expect(formatted).toContain('29');
      expect(formatted).toContain('February');
      expect(formatted).toContain('2024');
    });

    it('should format current date', () => {
      const now = new Date();
      const formatted = formatDate(now);
      expect(formatted).toContain(now.getFullYear().toString());
    });
  });

  describe('getPhonePeErrorMessage', () => {
    it('should return correct message for PAYMENT_ERROR', () => {
      const message = getPhonePeErrorMessage('PAYMENT_ERROR');
      expect(message).toBe('Payment initiation has failed');
    });

    it('should return correct message for INTERNAL_SERVER_ERROR', () => {
      const message = getPhonePeErrorMessage('INTERNAL_SERVER_ERROR');
      expect(message).toBe('Something went wrong');
    });

    it('should return correct message for BAD_REQUEST', () => {
      const message = getPhonePeErrorMessage('BAD_REQUEST');
      expect(message).toBe('Invalid request');
    });

    it('should return correct message for AUTHORIZATION_FAILED', () => {
      const message = getPhonePeErrorMessage('AUTHORIZATION_FAILED');
      expect(message).toBe('X-VERIFY header is incorrect');
    });

    it('should return default message for unknown error code', () => {
      const message = getPhonePeErrorMessage('UNKNOWN_ERROR');
      expect(message).toBe('An unknown error occurred');
    });

    it('should handle empty string', () => {
      const message = getPhonePeErrorMessage('');
      expect(message).toBe('An unknown error occurred');
    });

    it('should return correct message for all security blocks', () => {
      expect(getPhonePeErrorMessage('INTERNAL_SECURITY_BLOCK_1')).toBe('Mismatch in Transaction URL');
      expect(getPhonePeErrorMessage('INTERNAL_SECURITY_BLOCK_2')).toBe('Mismatch in Transaction IP Address');
      expect(getPhonePeErrorMessage('INTERNAL_SECURITY_BLOCK_4')).toBe('Mismatch in Transaction Package Name');
      expect(getPhonePeErrorMessage('INTERNAL_SECURITY_BLOCK_5')).toBe('Missing or outdated Business Policy/s');
      expect(getPhonePeErrorMessage('INTERNAL_SECURITY_BLOCK_6')).toBe('TPV Limit Reached');
    });
  });
});
