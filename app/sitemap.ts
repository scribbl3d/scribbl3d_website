import { prisma } from '@/lib/prisma';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');
  
  try {
    const [printers, resins, prebuiltProducts, blogs, categories] = await Promise.all([
      prisma.printer.findMany({ 
        where: { inStock: true },
        select: { slug: true, updatedAt: true } 
      }),
      prisma.resin.findMany({ 
        where: { inStock: true },
        select: { slug: true, updatedAt: true } 
      }),
      prisma.prebuiltProducts.findMany({ 
        where: { inStock: true },
        select: { slug: true, updatedAt: true } 
      }),
      prisma.blog.findMany({ 
        where: { published: true },
        select: { slug: true, updatedAt: true } 
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
        url: `${baseUrl}/filaments`,
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
    ];

    const printerPages = printers.map((printer) => ({
      url: `${baseUrl}/printers/${printer.slug}`,
      lastModified: printer.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const resinPages = resins.map((resin) => ({
      url: `${baseUrl}/resins/${resin.slug}`,
      lastModified: resin.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const prebuiltPages = prebuiltProducts.map((product) => ({
      url: `${baseUrl}/prebuilt-products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const blogPages = blogs
      .filter((blog) => blog.slug)
      .map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));

    const categoryPages = categories
      .filter((cat) => cat.category)
      .map((cat) => {
        const slug = cat.category.toLowerCase().replace(/\s+/g, '-');
        return {
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        };
      });

    return [
      ...staticPages,
      ...printerPages,
      ...resinPages,
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
