import BlogForm from "@/app/ops/control/blogs/components/BlogForm";

export default async function EditBlogPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8 pt-[40px]">
            <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>
            <BlogForm blogId={id} />
        </div>
    );
}
