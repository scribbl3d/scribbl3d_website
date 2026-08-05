import BlogPostLayout from "../_components/blog-post-layout";
import { prisma } from "@/lib/prisma";
import { generateBlogMetadata, generateStructuredData } from "@/lib/metadata";
import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type BlogPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({
    params,
}: BlogPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                OR: [{ slug }, { id: slug }],
            },
        });

        if (!blog) {
            return {
                title: "Blog Post Not Found",
            };
        }

        return generateBlogMetadata({
            title: blog.title,
            description: blog.description || blog.title,
            keywords: blog.keywords,
            slug: blog.slug || blog.id,
            image: blog.heroImage || blog.thumbnailImage || undefined,
            publishedAt: blog.publishedAt?.toISOString(),
        });
    } catch (error) {
        console.error("Error generating blog metadata:", error);
        return {
            title: "Blog Post",
        };
    }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
    const identifier = (await params).slug;

    // If accessed via CUID (id), redirect to the canonical slug URL
    const blog = await prisma.blog.findFirst({
        where: { OR: [{ slug: identifier }, { id: identifier }] },
    });

    if (!blog) {
        return <BlogPostLayout slug={identifier} />;
    }

    if (blog.slug && blog.slug !== identifier) {
        permanentRedirect(`/blog/${blog.slug}`);
    }

    // Generate BlogPosting structured data
    const jsonLd = generateStructuredData('blogPost', {
        title: blog.title,
        description: blog.description || blog.title,
        image: blog.heroImage || blog.thumbnailImage,
        author: 'Scribbl3D',
        publishedAt: blog.publishedAt?.toISOString(),
        updatedAt: blog.updatedAt?.toISOString(),
        slug: blog.slug || blog.id,
    });

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <BlogPostLayout slug={identifier} />
        </>
    );
}
