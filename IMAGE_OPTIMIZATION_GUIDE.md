# 🖼️ Image Optimization Guide - CRITICAL FIX

## 🚨 **Current Problem**

Your site has **450MB+ of unoptimized images:**
- `public/filaments/`: 252MB
- `public/landingpage/`: 154MB
- `public/printer-images/`: 27MB
- `public/services/`: 11MB

**Result:** 
- Mobile LCP: 18.8 seconds (Target: <2.5s)
- Total page size: 22MB (Target: <2MB)
- Mobile Performance: 52/100 (Target: 80+)

---

## ✅ **Quick Fix (30 minutes)**

### **Step 1: Install Sharp**
```bash
npm install --save-dev sharp
```

### **Step 2: Run Image Optimizer**
```bash
node scripts/optimize-images.js
```

This will:
- Convert all JPG/PNG to WebP (60-80% smaller)
- Resize large images to reasonable dimensions
- Keep original files (you can delete later)
- Save 200-300MB+ of bandwidth

**Expected Results:**
- 450MB → ~100MB (70-80% reduction)
- Mobile LCP: 18.8s → ~4-6s
- Mobile Performance: 52 → 70-80

---

## 🎯 **Manual Quick Wins (If script doesn't work)**

### **Option 1: Use Online Tool**
1. Go to https://squoosh.app
2. Drag hero images one by one
3. Settings:
   - Format: WebP
   - Quality: 80
   - Resize: 1920px width max
4. Download and replace

### **Option 2: Use TinyPNG**
1. Go to https://tinypng.com
2. Upload up to 20 images at once
3. Download compressed versions
4. Replace originals

### **Priority Images to Optimize First:**
1. **Hero banners** (`public/hero-images/`)
   - Currently: 1.1MB each
   - Target: <200KB each
   - Impact: Immediate LCP improvement

2. **Landing page images** (`public/landingpage/`)
   - Currently: 154MB total
   - Target: <5MB total
   - Impact: Huge bandwidth savings

3. **Product images** (`public/filaments/`, `public/printer-images/`)
   - Currently: 279MB total
   - Target: <20MB total
   - Impact: Faster product page loads

---

## 📊 **Image Size Guidelines**

| Image Type | Max Size | Recommended Format | Dimensions |
|------------|----------|-------------------|------------|
| Hero Banner | 200KB | WebP | 1920x800px |
| Product Card | 50KB | WebP | 600x600px |
| Product Detail | 150KB | WebP | 1200x1200px |
| Thumbnails | 20KB | WebP | 300x300px |
| Icons | 10KB | SVG or WebP | Varies |

---

## 🔧 **Ensure Next.js Image is Used Everywhere**

Check these files use `next/image`:
- ✅ Hero banners (already fixed)
- ⚠️  Product cards
- ⚠️  Product detail pages
- ⚠️  Landing page sections

Example:
```tsx
// ❌ Wrong
<img src="/products/printer.jpg" alt="Printer" />

// ✅ Correct
import Image from 'next/image';
<Image 
  src="/products/printer.webp" 
  alt="Printer"
  width={600}
  height={600}
  loading="lazy"
/>
```

---

## 🚀 **Advanced: Cloudinary Auto-Optimization**

Your images are already on Cloudinary. Make sure to use auto-optimization:

```tsx
// Add these transformations to Cloudinary URLs
const optimizedUrl = cloudinaryUrl.replace(
  '/upload/',
  '/upload/f_auto,q_auto:good,w_1200/'
);
```

Transformations:
- `f_auto` - Auto format (WebP/AVIF)
- `q_auto:good` - Auto quality
- `w_1200` - Max width 1200px
- `c_limit` - Don't upscale

---

## 📝 **Testing After Optimization**

### **1. Check File Sizes**
```bash
du -sh public/* | sort -rh
```

**Target:**
- All folders under 20MB
- Individual images under 200KB

### **2. Test PageSpeed**
```bash
npm run build
npm start
```
Then test at: https://pagespeed.web.dev/

**Target Scores:**
- Desktop: 90+
- Mobile: 80+
- LCP: <2.5s

### **3. Visual Quality Check**
- Open your site
- Check if images look good (no pixelation)
- Test on mobile device
- Ensure nothing is broken

---

## 🎯 **Expected Improvements**

### **Before:**
- Total images: 450MB
- Mobile LCP: 18.8s
- Mobile Performance: 52/100
- Page weight: 22MB

### **After Optimization:**
- Total images: ~100MB (78% reduction)
- Mobile LCP: ~4-6s (70% improvement)
- Mobile Performance: 70-80/100
- Page weight: ~5MB (77% reduction)

---

## ⚠️ **Important Notes**

1. **Don't delete originals immediately**
   - Test .webp versions first
   - Keep originals as backup for 1 week
   - Only delete after confirming everything works

2. **Update image references**
   - Change `.jpg` to `.webp` in code
   - Use Next.js Image component everywhere
   - Add explicit width/height props

3. **Lazy load below-fold images**
   - Add `loading="lazy"` to images
   - Use `priority={false}` for non-critical images
   - Already done for components via dynamic imports

---

## 🆘 **If Script Fails**

Manual optimization steps:
1. Identify largest images: `find public -type f -size +1M`
2. Compress each with Squoosh.app
3. Replace originals
4. Test site
5. Repeat for next largest files

---

## ✅ **Success Checklist**

- [ ] Sharp installed
- [ ] Optimization script run
- [ ] File sizes reduced by 70%+
- [ ] Site tested and working
- [ ] PageSpeed scores improved
- [ ] Mobile LCP under 5s
- [ ] Original files backed up
- [ ] Code updated to use .webp
- [ ] All images use next/image
- [ ] Lazy loading enabled

---

## 💡 **Pro Tips**

1. **Compress before uploading**
   - Don't upload 10MB images
   - Compress first with TinyPNG
   - Then upload to server

2. **Use proper dimensions**
   - Don't upload 4000x4000px images
   - Resize to actual display size
   - Save bandwidth and storage

3. **Monitor regularly**
   - Check image sizes monthly
   - Remove unused images
   - Optimize new uploads

4. **Automate in future**
   - Add pre-commit hook for image optimization
   - Use CI/CD to compress on deploy
   - Set up Cloudinary automatic optimization
