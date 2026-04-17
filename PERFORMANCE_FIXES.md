# Performance Optimization Guide

## 🚨 Critical Issues Identified

### Current Scores:
- **Desktop Performance**: 72/100 ❌
- **Mobile Performance**: 54/100 ❌❌
- **LCP (Desktop)**: 3.3s (Target: <2.5s) ❌
- **LCP (Mobile)**: 44.6s (Target: <2.5s) ❌❌❌
- **Speed Index (Mobile)**: 17.3s ❌❌

---

## ✅ Implemented Fixes

### 1. Next.js Config Optimizations
```javascript
- Added AVIF format (better compression than WebP)
- Enabled SWC minification
- Added compression
- Optimized package imports
- Added aggressive caching headers
- Remove console logs in production
```

### 2. Metadata Fixes
- Fixed OG image to proper 1200x630px
- Improved description length (98 → 140+ chars)
- Added call-to-action in description

---

## 🔧 Additional Fixes Needed

### Priority 1: Fix LCP (Largest Contentful Paint)

The LCP of 44.6s on mobile is extremely critical. This suggests:

#### A. Optimize Hero Images

1. **Preload Critical Images**

Add to `app/layout.tsx` (inside `<head>`):
```tsx
<link
  rel="preload"
  as="image"
  href="/hero-images/main-hero.png"
  imageSrcSet="/hero-images/main-hero.png 640w, /hero-images/main-hero.png 1200w"
  imageSizes="100vw"
  fetchPriority="high"
/>
```

2. **Use Priority Prop on Hero Images**

In your hero banner component:
```tsx
<Image
  src={heroImage}
  alt="Hero image"
  priority={true}  // ⭐ Add this
  quality={85}
  fill
  sizes="100vw"
/>
```

3. **Optimize Image Sizes**

Run this command to check image sizes:
```bash
du -sh public/hero-images/*
```

Recommended actions:
- Hero images should be max 200KB
- Use 1920px width for desktop hero
- Use 768px width for mobile hero
- Convert to WebP/AVIF format

#### B. Reduce Hero Image File Sizes

Option 1 - Use Sharp (Recommended):
```bash
npm install sharp
node scripts/optimize-images.js
```

Create `scripts/optimize-images.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/hero-images';
const outputDir = './public/hero-images/optimized';

fs.readdirSync(inputDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/)) {
    sharp(path.join(inputDir, file))
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/, '.webp')));
  }
});
```

Option 2 - Online Tools:
- https://squoosh.app (Google's image optimizer)
- https://tinypng.com

### Priority 2: Code Splitting

#### Dynamic Imports for Heavy Components

```tsx
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const CommunityShowcase = dynamic(() => import('./CommunityShowcase'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: false,
});

const Testimonials = dynamic(() => import('./Testimonials'), {
  ssr: true, // Keep SSR for SEO
});
```

### Priority 3: Font Optimization

In `app/layout.tsx`, ensure fonts use `display: swap`:
```tsx
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: 'swap', // ⭐ Add this
});
```

### Priority 4: Remove Render-Blocking Resources

#### A. Inline Critical CSS
Move critical CSS inline in `app/layout.tsx`:
```tsx
<style dangerouslySetInnerHTML={{
  __html: `
    .hero { /* critical hero styles */ }
    .navbar { /* critical navbar styles */ }
  `
}} />
```

#### B. Defer Non-Critical Scripts
```tsx
<Script src="/analytics.js" strategy="lazyOnload" />
```

### Priority 5: Reduce JavaScript Bundle Size

#### Check current bundle size:
```bash
npm run build
# Look at route sizes
```

#### Reduce bundle:
1. Replace heavy libraries:
   - Use `next/image` instead of custom image components
   - Replace moment.js with date-fns (if used)
   - Tree-shake unused icons from lucide-react

2. Code split by route:
```tsx
// Instead of importing all at once
import { Icon1, Icon2, Icon3, Icon4 } from 'lucide-react';

// Import only what's needed
import { Icon1 } from 'lucide-react/dist/esm/icons/icon-1';
```

### Priority 6: Optimize Third-Party Scripts

#### Google Analytics (if using):
```tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="afterInteractive"
/>
```

#### WhatsApp Support Button:
Move to footer and lazy load:
```tsx
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppSupportButton'), {
  ssr: false,
  loading: () => null,
});
```

---

## 📊 Testing & Monitoring

### Before Each Fix:
1. Run PageSpeed Insights
2. Note down current scores
3. Make changes
4. Test locally: `npm run build && npm start`
5. Run PageSpeed again
6. Compare scores

### Tools:
```bash
# Local lighthouse test
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Check bundle size
npm run build
# Look at .next/static/chunks

# Analyze bundle
npm install -D @next/bundle-analyzer
```

Add to `next.config.mjs`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`

---

## 🎯 Target Scores After Fixes

- **Performance (Desktop)**: 90+
- **Performance (Mobile)**: 80+
- **LCP**: < 2.5s
- **FCP**: < 1.8s
- **TBT**: < 200ms
- **CLS**: < 0.1

---

## 📝 Immediate Action Items

### This Hour:
1. ✅ Create proper 1200x630px OG image
2. ✅ Fix metadata description
3. ✅ Update next.config.mjs
4. ⏳ Add priority to hero images
5. ⏳ Preload critical images

### Today:
1. Optimize all hero banner images (reduce to <200KB each)
2. Add dynamic imports for heavy components
3. Add font display: swap
4. Lazy load WhatsApp button
5. Test and measure improvements

### This Week:
1. Implement image CDN (Cloudinary optimization)
2. Add service worker for caching
3. Optimize JavaScript bundle
4. Add resource hints (preconnect, dns-prefetch)
5. Implement progressive image loading

---

## 🔍 Common Issues Checklist

- [ ] Hero images over 200KB?
- [ ] Using priority prop on above-fold images?
- [ ] Heavy components loaded on initial render?
- [ ] Too many fonts loaded?
- [ ] Large JavaScript bundles?
- [ ] Render-blocking CSS?
- [ ] Third-party scripts blocking render?
- [ ] Images not using next/image?
- [ ] Missing width/height on images?
- [ ] Not using modern image formats (WebP/AVIF)?

---

## 💡 Quick Wins

These can boost your score by 10-20 points:

1. **Add these to hero images:**
   ```tsx
   priority={true}
   loading="eager"
   fetchPriority="high"
   ```

2. **Preconnect to external domains:**
   ```tsx
   <link rel="preconnect" href="https://res.cloudinary.com" />
   <link rel="dns-prefetch" href="https://res.cloudinary.com" />
   ```

3. **Enable Cloudinary auto-optimization:**
   ```
   https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto/image.jpg
   ```

4. **Add viewport meta (if missing):**
   ```tsx
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

5. **Remove unused CSS:**
   - Check if TailwindCSS is purging correctly
   - Remove unused component libraries
