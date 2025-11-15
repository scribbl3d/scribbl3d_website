import BlogList from "./_components/blog-list";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-[100px]">
      <h1 className="text-3xl font-bold mb-6">Blogs</h1>
      <BlogList />
    </div>
  );
}
