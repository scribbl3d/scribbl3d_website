import BlogForm from "../components/BlogForm";

export default function NewBlogPage() {
    return (
        <div className="container mx-auto px-4 py-8 pt-[40px]">
            <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
            <BlogForm />
        </div>
    );
}
