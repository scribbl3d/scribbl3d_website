import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');
  
  try {
    // Out-of-stock products stay listed: their pages remain live and show availability
    const [printers, resins, filaments, prebuiltProducts, blogs, categories] = await Promise.all([
      prisma.printer.findMany({ 
        select: { slug: true, updatedAt: true } 
      }),
      prisma.resin.findMany({ 
        select: { slug: true, updatedAt: true } 
      }),
      prisma.filament.findMany({ 
        select: { slug: true, id: true, updatedAt: true } 
      }),
      prisma.prebuiltProducts.findMany({ 
        select: { slug: true, updatedAt: true } 
      }),
      prisma.blog.findMany({ 
        where: { published: true },
        select: { slug: true, id: true, updatedAt: true } 
      }),
      // Get unique categories
      prisma.prebuiltProducts.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/printers`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/resins`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/filament`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/prebuilt-products`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/services`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/personalise`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      ...[
        'terms-conditions',
        'privacy-policy',
        'return-policy',
        'refund-policy',
        'shipping-policy',
      ].map((policy) => ({
        url: `${baseUrl}/${policy}`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.4,
      })),
    ];

    const printerPages = printers
      .filter((printer) => printer.slug && printer.slug.trim() !== '')
      .map((printer) => ({
        url: `${baseUrl}/printers/${printer.slug}`,
        lastModified: printer.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    const resinPages = resins
      .filter((resin) => resin.slug && resin.slug.trim() !== '')
      .map((resin) => ({
        url: `${baseUrl}/resins/${resin.slug}`,
        lastModified: resin.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // The filament route also resolves by id, so keep products without a slug
    const filamentPages = filaments
      .map((filament) => ({
        url: `${baseUrl}/filament/${filament.slug && filament.slug.trim() !== '' ? filament.slug : filament.id}`,
        lastModified: filament.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    const prebuiltPages = prebuiltProducts
      .filter((product) => product.slug && product.slug.trim() !== '')
      .map((product) => ({
        url: `${baseUrl}/prebuilt-products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    // Blog pages also resolve by id, so keep published posts without a slug
    const blogPages = blogs
      .map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug && blog.slug.trim() !== '' ? blog.slug : blog.id}`,
        lastModified: blog.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const categoryPages = categories
      .filter((cat) => cat.category && cat.category.trim() !== '')
      .map((cat) => {
        const slug = cat.category.toLowerCase().replace(/\s+/g, '-');
        return {
          url: `${baseUrl}/prebuilt-products/category/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        };
      });

    return [
      ...staticPages,
      ...printerPages,
      ...resinPages,
      ...filamentPages,
      ...prebuiltPages,
      ...blogPages,
      ...categoryPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }
}
