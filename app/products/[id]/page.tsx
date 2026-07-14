import { notFound } from "next/navigation";

async function getProduct(id: string) {
  // Try regular product first
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      { cache: "no-store" }
    );
    if (res.ok) return res.json();
    if (res.status !== 404) throw new Error("Failed to fetch product");
  } catch {
    // Continue to try prebuilt
  }
  // Try prebuilt product if not found in regular
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/prebuilt-products/${id}`,
      { cache: "no-store" }
    );
    if (res.ok) return res.json();
  } catch {
    // Ignore
  }
  return null;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const id = (await params).id;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Note: Filaments are now handled by /filament/[id] route
  // This page only handles regular products and prebuilt products
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description || product.productdesc}</p>
        <div className="text-2xl font-bold text-blue-600">
          ₹{product.price?.toLocaleString("en-IN")}
        </div>
        {/* TODO: Add proper product display component */}
      </div>
    </div>
  );
}
