import BlogPostLayout from "../_components/blog-post-layout";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogPostLayout blogId={id} />;
}
