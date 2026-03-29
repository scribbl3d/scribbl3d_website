import BlogPostLayout from "../_components/blog-post-layout";

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;

    return <BlogPostLayout slug={slug} />;
}
