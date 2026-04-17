import BlogPostLayout from "../_components/blog-post-layout";
import { prisma } from "@/lib/prisma";
import { generateBlogMetadata } from "@/lib/metadata";
import { Metadata } from "next";

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
    const slug = (await params).slug;

    return <BlogPostLayout slug={slug} />;
}
