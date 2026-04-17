# SEO Implementation Guide for Scribbl3D

This document outlines the SEO improvements implemented in the Scribbl3D project.

## ✅ Implemented Features

### 1. **Core SEO Files**

#### `public/robots.txt`
- Controls search engine crawlers
- Disallows private routes (admin, checkout, profile, etc.)
- Points to sitemap

#### `app/sitemap.ts`
- Dynamic sitemap generation
- Includes all products (printers, resins, prebuilt products)
- Includes all blog posts
- Includes category pages
- Updates automatically based on database content

### 2. **Metadata Enhancements**

#### `lib/metadata.ts`
Central metadata utilities including:
- `defaultMetadata`: Comprehensive root metadata with Open Graph and Twitter cards
- `generateProductMetadata()`: Product-specific metadata generator
- `generateBlogMetadata()`: Blog post metadata generator
- `generateStructuredData()`: JSON-LD structured data for products and blogs

#### Root Layout (`app/layout.tsx`)
Enhanced with:
- Open Graph tags for social sharing
- Twitter card metadata
- Proper meta descriptions and keywords
- Verification tags for Google Search Console

#### Dynamic Pages
- **Blog Posts** (`app/blog/[slug]/page.tsx`): Full metadata with OG tags
- **Category Pages** (`app/[category]/page.tsx`): Enhanced with keywords and canonical URLs

### 3. **Structured Data Component**

#### `components/StructuredData.tsx`
Reusable component for adding JSON-LD structured data to pages.

**Usage Example:**
```tsx
import StructuredData from '@/components/StructuredData';
import { generateStructuredData } from '@/lib/metadata';

// In your page component
const structuredData = generateStructuredData('product', {
  name: printer.name,
  description: printer.description,
  price: printer.price,
  images: printer.images.map(img => img.url),
  brand: printer.brand,
  category: 'printers',
  slug: printer.slug,
  inStock: printer.inStock,
});

return (
  <>
    <StructuredData data={structuredData} />
    {/* Your page content */}
  </>
);
```

## 📝 Next Steps to Complete

### 1. **Environment Variables**
Add to your `.env` file:
```
NEXT_PUBLIC_BASE_URL="https://scribbl3d.com"
```

For local development:
```
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. **Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (scribbl3d.com)
3. Get verification code
4. Add to `lib/metadata.ts`:
```typescript
verification: {
  google: 'your-verification-code-here',
}
```

### 3. **Convert Product Pages to Server Components**

The printer detail page (`app/printers/[slug]/page.tsx`) is currently a client component. To add proper SEO metadata:

**Option A: Create a wrapper**
```typescript
// app/printers/[slug]/page.tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata } from '@/lib/metadata';
import PrinterDetailClient from './PrinterDetailClient';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const printer = await prisma.printer.findUnique({
    where: { slug },
    include: { images: true },
  });
  
  if (!printer) return { title: 'Printer Not Found' };
  
  return generateProductMetadata({
    name: printer.name,
    description: printer.shortDescription,
    price: printer.price,
    originalPrice: printer.originalPrice,
    images: printer.images.map(img => img.url),
    category: 'printers',
    slug: printer.slug,
  });
}

export default async function PrinterDetailPage({ params }) {
  const { slug } = await params;
  return <PrinterDetailClient slug={slug} />;
}
```

**Option B: Use Next.js middleware**
Implement metadata in a layout wrapper while keeping the page as a client component.

### 4. **Add Structured Data to Product Pages**

For each product page (printers, resins, prebuilt), add:
```tsx
import StructuredData from '@/components/StructuredData';
import { generateStructuredData } from '@/lib/metadata';

// In your component
const productSchema = generateStructuredData('product', {
  name: product.name,
  description: product.description,
  price: product.price,
  images: product.images,
  brand: product.brand || 'Scribbl3D',
  category: 'printers', // or 'resins', 'prebuilt-products'
  slug: product.slug,
  inStock: product.inStock,
});

return (
  <>
    <StructuredData data={productSchema} />
    {/* existing content */}
  </>
);
```

### 5. **Add Breadcrumb Schema**

Enhance existing breadcrumbs with structured data:
```tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.label,
    "item": `${baseUrl}${item.href}`,
  })),
};
```

### 6. **Image Optimization**

Ensure all product images have:
- Descriptive `alt` text
- Proper dimensions
- Optimized file sizes
- WebP format (already configured in `next.config.mjs`)

### 7. **Page Speed Optimization**

Check with Google PageSpeed Insights and implement:
- Lazy loading for below-fold images
- Prefetching for product links
- Code splitting
- Resource hints

### 8. **Analytics & Monitoring**

1. **Google Analytics 4**
   - Add GA4 tracking code
   - Set up e-commerce events

2. **Google Tag Manager**
   - Container setup
   - Event tracking

3. **Search Console Monitoring**
   - Submit sitemap
   - Monitor indexing status
   - Check for crawl errors

## 🔍 Testing Your SEO

### Local Testing
```bash
npm run build
npm start
```

Visit: `http://localhost:3000/sitemap.xml`

### Production Testing Tools

1. **Structured Data Testing**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Schema.org Validator](https://validator.schema.org/)

2. **Meta Tags Testing**
   - [OpenGraph Preview](https://www.opengraph.xyz/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

3. **Overall SEO**
   - [Google PageSpeed Insights](https://pagespeed.web.dev/)
   - [Lighthouse](https://developer.chrome.com/docs/lighthouse/)

### Check List Before Going Live

- [ ] Set `NEXT_PUBLIC_BASE_URL` in production environment
- [ ] Update robots.txt sitemap URL to production domain
- [ ] Verify Google Search Console
- [ ] Submit sitemap to Google Search Console
- [ ] Test all meta tags with social media debuggers
- [ ] Verify structured data with Google Rich Results Test
- [ ] Run Lighthouse audit (target 90+ for SEO)
- [ ] Test mobile responsiveness
- [ ] Check canonical URLs are correct
- [ ] Ensure all images have alt text

## 📊 Monitoring

### Weekly Tasks
- Check Search Console for errors
- Monitor organic traffic in Google Analytics
- Review top-performing pages

### Monthly Tasks
- Update content on low-performing pages
- Add new blog posts for fresh content
- Review and update product descriptions
- Check for broken links
- Monitor page speed metrics

## 🎯 SEO Best Practices Being Followed

✅ Semantic HTML structure
✅ Mobile-responsive design
✅ Fast page load times
✅ HTTPS (ensure in production)
✅ Clean URL structure
✅ Descriptive meta titles and descriptions
✅ Open Graph and Twitter cards
✅ Structured data (JSON-LD)
✅ XML sitemap
✅ Robots.txt
✅ Canonical URLs
✅ Image optimization
✅ Internal linking (breadcrumbs)

## 📚 Additional Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Web.dev SEO](https://web.dev/learn/seo/)
