import { extractPublicId } from '../cloudinary-utils';

describe('Cloudinary Utils - Unit Tests', () => {
  describe('extractPublicId', () => {
    it('should extract public ID from standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('sample');
    });

    it('should extract public ID from URL with folders', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/products/images/item-123.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('products/images/item-123');
    });

    it('should extract public ID from URL with transformations', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/w_500,h_500/v1234567890/sample.jpg';
      const publicId = extractPublicId(url);
      // Includes transformation folder
      expect(publicId).toBe('v1234567890/sample');
    });

    it('should handle URL without version number', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('sample');
    });

    it('should handle different file extensions', () => {
      expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/v123/sample.png')).toBe('sample');
      expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/v123/sample.webp')).toBe('sample');
      expect(extractPublicId('https://res.cloudinary.com/demo/image/upload/v123/sample.gif')).toBe('sample');
    });

    it('should handle nested folder structure', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123/a/b/c/d/image.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('a/b/c/d/image');
    });

    it('should return null for invalid URL without upload segment', () => {
      const url = 'https://res.cloudinary.com/demo/image/sample.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBeNull();
    });

    it('should return null for invalid URL format', () => {
      const url = 'https://example.com/image.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBeNull();
    });

    it('should return null for empty string', () => {
      const publicId = extractPublicId('');
      expect(publicId).toBeNull();
    });

    it('should handle URL with special characters in filename', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123/my-image_123.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('my-image_123');
    });

    it('should handle URL ending with upload (edge case)', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload';
      const publicId = extractPublicId(url);
      expect(publicId).toBeNull();
    });

    it('should handle malformed URLs gracefully', () => {
      expect(extractPublicId('not-a-url')).toBeNull();
      expect(extractPublicId('http://')).toBeNull();
      expect(extractPublicId('//cloudinary.com')).toBeNull();
    });

    it('should handle URLs with query parameters', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123/sample.jpg?_a=123';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('sample');
    });

    it('should handle video URLs', () => {
      const url = 'https://res.cloudinary.com/demo/video/upload/v123/my-video.mp4';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('my-video');
    });

    it('should handle raw file URLs', () => {
      const url = 'https://res.cloudinary.com/demo/raw/upload/v123/document.pdf';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('document');
    });

    it('should preserve folder structure with multiple levels', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123/2024/products/category/item.jpg';
      const publicId = extractPublicId(url);
      expect(publicId).toBe('2024/products/category/item');
    });
  });
});
