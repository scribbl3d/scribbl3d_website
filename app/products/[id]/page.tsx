import { notFound } from "next/navigation";
import FilamentProductPage from "@/components/filament-product-page";

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

  // Transform the product data to match FilamentProductPage props
  const productData = {
    ...product,
    reviews: product.reviews || [],
    colors: product.colors || [
      { id: "1", name: product.color, hexCode: product.color },
    ],
    sizes: product.sizes || [
      {
        id: "1",
        name: "1kg",
        price: product.price,
        originalPrice: product.originalPrice,
      },
    ],
    material: product.category,
    diameter: "1.75mm",
    temperature: "190-210°C",
    description:
      product.productdesc || product.description || "No description available",
    weight: product.weight || 1000, // fallback to 1kg in grams
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="max-w-[1440px] w-full pb-8">
        <FilamentProductPage {...productData} />
      </div>
    </div>
  );
}
