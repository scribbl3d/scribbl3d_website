import {
  calculateDistance,
  calculateShippingDays,
  getEstimatedDeliveryDate,
} from '../shipping-calculator';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    pincodeLocation: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Shipping Calculator - Unit Tests', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between Delhi and Mumbai correctly', () => {
      const delhi = { latitude: 28.7041, longitude: 77.1025 };
      const mumbai = { latitude: 19.0760, longitude: 72.8777 };
      
      const distance = calculateDistance(delhi, mumbai);
      
      // Expected distance is approximately 1150-1200 km
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1250);
    });

    it('should return 0 for same coordinates', () => {
      const coord = { latitude: 28.7041, longitude: 77.1025 };
      
      const distance = calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });

    it('should calculate short distances accurately', () => {
      const coord1 = { latitude: 28.7041, longitude: 77.1025 };
      const coord2 = { latitude: 28.7041, longitude: 77.2025 }; // ~10km east
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(15);
    });

    it('should handle negative coordinates', () => {
      const coord1 = { latitude: -33.8688, longitude: 151.2093 }; // Sydney
      const coord2 = { latitude: 28.7041, longitude: 77.1025 }; // Delhi
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(9000);
      expect(distance).toBeLessThan(11000);
    });

    it('should be symmetric (distance A to B = B to A)', () => {
      const coord1 = { latitude: 28.7041, longitude: 77.1025 };
      const coord2 = { latitude: 19.0760, longitude: 72.8777 };
      
      const distance1 = calculateDistance(coord1, coord2);
      const distance2 = calculateDistance(coord2, coord1);
      
      expect(distance1).toBe(distance2);
    });

    it('should handle equator coordinates', () => {
      const coord1 = { latitude: 0, longitude: 0 };
      const coord2 = { latitude: 0, longitude: 10 };
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(1200);
    });

    it('should handle polar coordinates', () => {
      const northPole = { latitude: 90, longitude: 0 };
      const southPole = { latitude: -90, longitude: 0 };
      
      const distance = calculateDistance(northPole, southPole);
      
      // Half of Earth's circumference ~20000km
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });
  });

  describe('calculateShippingDays', () => {
    it('should return 1 day for distances up to 100km', () => {
      expect(calculateShippingDays(0)).toBe(1);
      expect(calculateShippingDays(50)).toBe(1);
      expect(calculateShippingDays(100)).toBe(1);
    });

    it('should return 2 days for distances between 101-500km', () => {
      expect(calculateShippingDays(101)).toBe(2);
      expect(calculateShippingDays(300)).toBe(2);
      expect(calculateShippingDays(500)).toBe(2);
    });

    it('should return 3 days for distances between 501-1000km', () => {
      expect(calculateShippingDays(501)).toBe(3);
      expect(calculateShippingDays(750)).toBe(3);
      expect(calculateShippingDays(1000)).toBe(3);
    });

    it('should return 4 days for distances over 1000km', () => {
      expect(calculateShippingDays(1001)).toBe(4);
      expect(calculateShippingDays(2000)).toBe(4);
      expect(calculateShippingDays(5000)).toBe(4);
    });

    it('should handle boundary values correctly', () => {
      expect(calculateShippingDays(100)).toBe(1);
      expect(calculateShippingDays(101)).toBe(2);
      expect(calculateShippingDays(500)).toBe(2);
      expect(calculateShippingDays(501)).toBe(3);
      expect(calculateShippingDays(1000)).toBe(3);
      expect(calculateShippingDays(1001)).toBe(4);
    });

    it('should handle decimal distances', () => {
      expect(calculateShippingDays(99.9)).toBe(1);
      expect(calculateShippingDays(100.1)).toBe(2);
      expect(calculateShippingDays(500.5)).toBe(3);
    });

    it('should handle very large distances', () => {
      expect(calculateShippingDays(10000)).toBe(4);
      expect(calculateShippingDays(20000)).toBe(4);
    });
  });

  describe('getEstimatedDeliveryDate', () => {
    beforeEach(() => {
      // Mock current date to Jan 1, 2024 for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should add correct number of days to current date', () => {
      const result = getEstimatedDeliveryDate(1);
      expect(result).toContain('2024');
      expect(result).toContain('January');
      expect(result).toContain('2'); // Jan 2
    });

    it('should handle multiple days correctly', () => {
      const result = getEstimatedDeliveryDate(5);
      expect(result).toContain('2024');
      expect(result).toContain('January');
      expect(result).toContain('6'); // Jan 6
    });

    it('should format with weekday', () => {
      const result = getEstimatedDeliveryDate(1);
      // Should contain a weekday name
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const hasWeekday = weekdays.some(day => result.includes(day));
      expect(hasWeekday).toBe(true);
    });

    it('should handle zero days', () => {
      const result = getEstimatedDeliveryDate(0);
      expect(result).toContain('2024');
      expect(result).toContain('January');
      expect(result).toContain('1'); // Same day
    });

    it('should handle month transitions', () => {
      jest.setSystemTime(new Date('2024-01-30T00:00:00.000Z'));
      const result = getEstimatedDeliveryDate(5);
      expect(result).toContain('February');
      expect(result).toContain('4');
    });

    it('should handle year transitions', () => {
      jest.setSystemTime(new Date('2024-12-30T00:00:00.000Z'));
      const result = getEstimatedDeliveryDate(5);
      expect(result).toContain('2025');
      expect(result).toContain('January');
    });
  });
});
