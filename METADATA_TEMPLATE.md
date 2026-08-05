# 📋 Metadata Object Template for All Pages

## Complete Metadata Structure

Use this template for any page in your Next.js app.

---

## 🎯 STANDARD PAGE METADATA

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
    // Page Title (appears in browser tab and search results)
    title: {
        absolute: 'Your Page Title — Keywords | Scribbl3D',
        // OR use default template:
        // default: 'Your Page Title',
        // template: '%s | Scribbl3D',
    },

    // Meta Description (appears in search results)
    description: 'Your compelling description here. Include keywords, benefits, and call-to-action. Keep under 160 characters.',

    // Keywords (for SEO)
    keywords: [
        'primary keyword',
        'secondary keyword',
        'brand name',
        'product type',
        'location',
        'Scribbl3D',
    ],

    // Canonical URL (prevents duplicate content issues)
    alternates: {
        canonical: 'https://www.scribbl3d.com/your-page-url',
    },

    // Open Graph (for Facebook, LinkedIn, etc.)
    openGraph: {
        title: 'Your OG Title — Optimized for Social Sharing',
        description: 'Your OG description. Can be different from meta description.',
        url: 'https://www.scribbl3d.com/your-page-url',
        type: 'website', // or 'article' for blog posts
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [
            {
                url: 'https://www.scribbl3d.com/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Image description for accessibility',
            },
        ],
    },

    // Twitter Card (for Twitter/X sharing)
    twitter: {
        card: 'summary_large_image',
        title: 'Your Twitter Title',
        description: 'Your Twitter description.',
        images: ['https://www.scribbl3d.com/og-image.png'],
        creator: '@Scribbl3d_',
        site: '@Scribbl3d_',
    },

    // Robots (control search engine indexing)
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Additional metadata
    authors: [{ name: 'Scribbl3D' }],
    creator: 'Scribbl3D',
    publisher: 'Scribbl3D',
    category: 'Technology', // or 'E-commerce', 'Manufacturing', etc.
};
```

---

## 🛍️ PRODUCT/CATEGORY PAGE METADATA

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        absolute: 'Buy [Product Category] Online in India — [Brands] | Scribbl3D',
    },
    description: 'Shop [product type] from [brands]. [Key benefits]. Best prices in India, fast shipping, expert support.',
    keywords: [
        '[product] India',
        'buy [product] online',
        '[brand 1]',
        '[brand 2]',
        'best [product] India',
        'Scribbl3D',
    ],
    alternates: {
        canonical: 'https://www.scribbl3d.com/[category]',
    },
    openGraph: {
        title: 'Buy [Product Category] Online in India | Scribbl3D',
        description: 'Shop [product type] from top brands. Best prices in India.',
        url: 'https://www.scribbl3d.com/[category]',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-[category].png',
            width: 1200,
            height: 630,
            alt: '[Product Category] - [Description]',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Buy [Product Category] Online in India | Scribbl3D',
        description: 'Shop [product type] from [brands]. Best prices in India.',
        images: ['https://www.scribbl3d.com/og-[category].png'],
    },
};
```

---

## 📝 BLOG POST METADATA (Dynamic)

```typescript
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params;
    
    const post = await prisma.blog.findUnique({
        where: { slug },
    });

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${post.title} | Scribbl3D Blog`,
        description: post.description || post.title,
        keywords: post.keywords?.split(',') || [post.title, 'Scribbl3D', '3D printing'],
        alternates: {
            canonical: `https://www.scribbl3d.com/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description || post.title,
            url: `https://www.scribbl3d.com/blog/${post.slug}`,
            type: 'article',
            locale: 'en_IN',
            siteName: 'Scribbl3D',
            images: post.heroImage ? [{
                url: post.heroImage,
                width: 1200,
                height: 630,
                alt: post.title,
            }] : [],
            publishedTime: post.publishedAt?.toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: ['Scribbl3D'],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description || post.title,
            images: post.heroImage ? [post.heroImage] : [],
        },
    };
}
```

---

## 🏷️ INDIVIDUAL PRODUCT METADATA (Dynamic)

```typescript
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params;
    
    const product = await prisma.printer.findUnique({
        where: { slug },
        include: { images: true },
    });

    if (!product) {
        return { title: 'Product Not Found' };
    }

    const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url;
    const price = `₹${(product.price / 100).toLocaleString('en-IN')}`;

    return {
        title: `${product.name} — Buy Online in India | Scribbl3D`,
        description: product.description || `Buy ${product.name} online in India. ${price}. Fast shipping, expert support, best price guaranteed.`,
        keywords: [
            product.name,
            '3D printer',
            'buy online India',
            product.brand || '',
            'Scribbl3D',
        ],
        alternates: {
            canonical: `https://www.scribbl3d.com/printers/${product.slug}`,
        },
        openGraph: {
            title: `${product.name} | Scribbl3D`,
            description: product.description || `Buy ${product.name} online in India. ${price}.`,
            url: `https://www.scribbl3d.com/printers/${product.slug}`,
            type: 'website',
            locale: 'en_IN',
            siteName: 'Scribbl3D',
            images: mainImage ? [{
                url: mainImage,
                width: 1200,
                height: 630,
                alt: product.name,
            }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Scribbl3D`,
            description: product.description || `Buy ${product.name} online in India.`,
            images: mainImage ? [mainImage] : [],
        },
    };
}
```

---

## 🏠 HOMEPAGE METADATA

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scribbl3D — Premium 3D Printers, Filaments & Resins in India',
    description: 'Discover how Scribbl3D transforms ideas into reality with advanced 3D printing solutions, rapid prototyping, and custom manufacturing. Shop 3D printers, filaments, resins, and more.',
    keywords: [
        'Scribbl3D',
        '3D printing India',
        '3D printers',
        'filaments',
        'resins',
        'rapid prototyping',
        'custom manufacturing',
        'Bambu Lab',
        'Creality',
        'Anycubic',
    ],
    alternates: {
        canonical: 'https://www.scribbl3d.com',
    },
    openGraph: {
        title: 'Scribbl3D — Premium 3D Printing Solutions in India',
        description: 'Transform ideas into reality with advanced 3D printing solutions, rapid prototyping, and custom manufacturing.',
        url: 'https://www.scribbl3d.com',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-home.png',
            width: 1200,
            height: 630,
            alt: 'Scribbl3D - Premium 3D Printing Solutions',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Scribbl3D — Premium 3D Printing Solutions in India',
        description: 'Transform ideas into reality with advanced 3D printing solutions.',
        images: ['https://www.scribbl3d.com/og-home.png'],
    },
};
```

---

## 📄 INFORMATIONAL PAGE METADATA (About, Services, etc.)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us — Scribbl3D | Industrial 3D Printing Solutions',
    description: 'Learn about Scribbl3D, India\'s leading provider of industrial 3D printing solutions. High-performance FDM, SLA, and resin printing for prototyping and manufacturing.',
    keywords: [
        'Scribbl3D',
        'about us',
        '3D printing company',
        'industrial 3D printing',
        'India',
        'manufacturing',
    ],
    alternates: {
        canonical: 'https://www.scribbl3d.com/about',
    },
    openGraph: {
        title: 'About Scribbl3D | Industrial 3D Printing Solutions',
        description: 'India\'s leading provider of industrial 3D printing solutions.',
        url: 'https://www.scribbl3d.com/about',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-about.png',
            width: 1200,
            height: 630,
            alt: 'About Scribbl3D',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Scribbl3D | Industrial 3D Printing Solutions',
        description: 'India\'s leading provider of industrial 3D printing solutions.',
        images: ['https://www.scribbl3d.com/og-about.png'],
    },
};
```

---

## 🎯 QUICK REFERENCE

### **What to Change for Each Page:**

1. **`title`** - Page title (60 chars max)
2. **`description`** - Meta description (160 chars max)
3. **`keywords`** - Relevant keywords (5-10)
4. **`canonical`** - Full URL of the page
5. **`openGraph.title`** - Social media title
6. **`openGraph.description`** - Social media description
7. **`openGraph.url`** - Full URL of the page
8. **`openGraph.images[0].url`** - OG image URL (1200x630px)
9. **`twitter.title`** - Twitter title
10. **`twitter.description`** - Twitter description
11. **`twitter.images[0]`** - Twitter image URL

---

## ✅ BEST PRACTICES

### **Title**:
- ✅ 50-60 characters
- ✅ Include primary keyword
- ✅ Include brand name
- ✅ Use separators: `—` or `|`
- ❌ Don't keyword stuff

### **Description**:
- ✅ 150-160 characters
- ✅ Include call-to-action
- ✅ Mention key benefits
- ✅ Include location if relevant
- ❌ Don't duplicate title

### **Keywords**:
- ✅ 5-10 relevant keywords
- ✅ Include brand names
- ✅ Include product types
- ✅ Include location
- ❌ Don't overdo it

### **Images**:
- ✅ 1200x630px (recommended)
- ✅ Under 1MB file size
- ✅ Descriptive alt text
- ✅ HTTPS URLs only

---

## 📋 CURRENT PAGES TO CONFIGURE

| Page | File | Status |
|------|------|--------|
| Homepage | `/app/page.tsx` | ✅ Configured |
| Printers | `/app/printers/page.tsx` | ✅ Configured |
| Filaments | `/app/filament/page.tsx` | ✅ Configured |
| Resins | `/app/resins/page.tsx` | ✅ Configured |
| Prebuilt Products | `/app/prebuilt-products/page.tsx` | ✅ Configured |
| Blog Listing | `/app/blog/page.tsx` | ✅ Configured |
| About | `/app/about/page.tsx` | ⚠️ Check |
| Services | `/app/services/page.tsx` | ⚠️ Check |
| Privacy Policy | `/app/privacy-policy/page.tsx` | ⚠️ Check |
| Terms & Conditions | `/app/terms-conditions/page.tsx` | ⚠️ Check |

---

## 🚀 HOW TO USE THIS TEMPLATE

1. **Copy the appropriate template** (static or dynamic)
2. **Replace placeholders** with your actual content
3. **Update all URLs** to match your page
4. **Update image URLs** to your OG images
5. **Save the file**
6. **Build and deploy**

```bash
npm run build
git add .
git commit -m "Update metadata for [page name]"
git push origin main
```

---

**This template covers all metadata needs for your entire website!** 🎉
