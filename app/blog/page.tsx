import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogList from "./_components/blog-list";
import CollectionPageSchema from '@/components/seo/CollectionPageSchema';

export const metadata: Metadata = {
    title: {
        absolute: 'Blog - 3D Printing Guides, Tutorials & Industry Insights | Scribbl3D',
    },
    description:
        'Explore expert guides, tutorials, and insights on 3D printing. Learn about filaments, printers, techniques, and industry trends from Scribbl3D.',
    keywords: [
        '3D printing blog',
        '3D printing tutorials',
        '3D printing guides',
        'filament guides',
        'printer reviews',
        '3D printing tips',
        'additive manufacturing',
        'Scribbl3D blog'
    ],
    alternates: { canonical: 'https://www.scribbl3d.com/blog' },
    openGraph: {
        title: 'Blog - 3D Printing Guides & Tutorials | Scribbl3D',
        description:
            'Expert guides, tutorials, and insights on 3D printing. Learn about filaments, printers, and techniques.',
        url: 'https://www.scribbl3d.com/blog',
        type: 'website',
        locale: 'en_IN',
        siteName: 'Scribbl3D',
        images: [{
            url: 'https://www.scribbl3d.com/og-blog.png',
            width: 1200,
            height: 630,
            alt: 'Scribbl3D Blog - 3D Printing Guides & Tutorials'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog - 3D Printing Guides & Tutorials | Scribbl3D',
        description: 'Expert guides and tutorials on 3D printing, filaments, printers, and techniques.',
        images: ['https://www.scribbl3d.com/og-blog.png'],
    },
};

export default async function BlogPage() {
    const totalBlogs = await prisma.blog.count();
    return (
        <>
            <CollectionPageSchema
                name="Blog - 3D Printing Guides & Tutorials"
                description="Explore expert guides, tutorials, and insights on 3D printing from Scribbl3D"
                url="https://www.scribbl3d.com/blog"
                numberOfItems={totalBlogs}
            />
            <div className="container mx-auto px-4 py-8 pt-[100px]">
                <BlogList />
            </div>
        </>
    );
}
