import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import ProductGrid from "../../components/ProductGrid";
import Link from "next/link";

// Mapping between URL-friendly names and database names
const categoryMapping: Record<string, string> = {
  pla: "PLAplus",
  plaplus: "PLAplus",
  abs: "ABS",
  petg: "PETG",
  tpu: "TPU",
  nylon: "Nylon",
};

// Mapping for display names (what users see)
const displayNameMapping: Record<string, string> = {
  PLAplus: "PLA+",
  ABS: "ABS",
  PETG: "PETG",
  TPU: "TPU",
  Nylon: "Nylon",
};

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getProductsByCategory(category: string) {
  const dbCategory = categoryMapping[category.toLowerCase()];
  if (!dbCategory) {
    return null;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}/api/products?category=${dbCategory}&type=filament`;
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch products: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching filament products:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const dbCategory = categoryMapping[category.toLowerCase()];
  const displayName = displayNameMapping[dbCategory] || "Filament";

  return {
    title: `${displayName} Filaments | Scribbl3D`,
    description: `Explore our ${displayName.toLowerCase()} filaments at Scribbl3D`,
  };
}

export default async function FilamentCategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;
  const urlCategory = category.toLowerCase();
  const dbCategory = categoryMapping[urlCategory];

  if (!dbCategory) {
    notFound();
  }

  const displayName = displayNameMapping[dbCategory];
  const products = await getProductsByCategory(urlCategory);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Filaments", href: "/filaments" },
    { label: displayName, href: `/filaments/categories/${urlCategory}` },
  ];

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl font-bold mb-8">{displayName} Filaments</h1>
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 mt-[70px]">
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/filaments"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Filaments
        </Link>
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold">
            {displayName} Filaments
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-3 w-1 bg-gray-300"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full leading-normal m-1">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 justify-items-center">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
