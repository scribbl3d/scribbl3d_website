# Open Graph Image Creation Guide

## 🖼️ **Create Your OG Image (1200x630px)**

You need to replace the placeholder `public/og-image.png` with an actual image.

### **Option 1: Design Tool (Recommended)**

Use Canva (Free):
1. Go to canva.com
2. Create custom size: 1200 x 630 pixels
3. Design your image with:
   - Scribbl3D logo
   - Catchy headline: "Premium 3D Printers, Filaments & Resins"
   - Product images (3D printer showcase)
   - Your brand colors
   - Optional: Call-to-action text

### **Option 2: Use Figma Template**

1. Download this template: [Social Media Templates](https://www.figma.com/community/search?model_type=files&q=og%20image)
2. Customize with your branding
3. Export as PNG at 1200x630px

### **Option 3: Quick Tool - OG Image Generator**

Use online tools:
- https://www.opengraph.xyz/
- https://www.bannerbear.com/tools/og-image-generator/
- https://og-image.vercel.app/

### **Design Guidelines**

**Must Have:**
- Dimensions: Exactly 1200 x 630 pixels
- File size: Under 300KB
- Format: PNG or JPG
- Text: Large, readable (minimum 60px font)
- Branding: Logo and brand colors

**Best Practices:**
- Keep text in the center (safe zone)
- Avoid edges (might be cropped on some platforms)
- Use high contrast colors
- Include 1-2 product images
- Keep it simple and professional

### **Content Suggestions**

**Headline Options:**
- "India's Premier 3D Printing Destination"
- "Premium 3D Printers & Materials"
- "Transform Ideas into Reality with 3D Printing"

**Visual Elements:**
- 3D printer image (your best seller)
- Sample 3D printed objects
- Scribbl3D logo
- Trust badges (if any)

### **Testing Your OG Image**

After creating, test with:
1. [Facebook Debugger](https://developers.facebook.com/tools/debug/)
2. [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
4. [OpenGraph Preview](https://www.opengraph.xyz/)

### **Installation**

1. Save your image as `og-image.png`
2. Place it in `/public/` folder
3. Replace the current placeholder file
4. Clear cache and test

### **Quick Template Text**

If designing in Canva:

**Main Text (Large, Bold):**
```
SCRIBBL3D
Premium 3D Printers & Materials
```

**Subtext (Medium):**
```
Fast Shipping • Expert Support • Best Prices in India
```

**CTA (Small):**
```
Shop Now at scribbl3d.com
```

---

## Example Layout

```
┌─────────────────────────────────────────┐
│  SCRIBBL3D [Logo]                       │
│                                         │
│  Premium 3D Printers,                   │
│  Filaments & Resins                     │
│                                         │
│  [Product Image]                        │
│                                         │
│  ✓ Fast Shipping  ✓ Expert Support     │
│  scribbl3d.com                          │
└─────────────────────────────────────────┘
```

---

## Color Scheme Suggestions

Based on your site (adjust as needed):

- Primary: #4f46e5 (Indigo)
- Secondary: #c4b5fd (Light Purple)
- Background: White or #f9fafb
- Text: #111827 (Dark Gray)
- Accent: Orange/Gold for CTAs
