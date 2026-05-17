import BlogPostLayout from "../_components/blog-post-layout";
import { prisma } from "@/lib/prisma";
import { generateBlogMetadata } from "@/lib/metadata";
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
        select: { id: true, slug: true },
    });

    if (blog && blog.slug && blog.slug !== identifier) {
        permanentRedirect(`/blog/${blog.slug}`);
    }

    return <BlogPostLayout slug={identifier} />;
}
