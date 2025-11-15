import { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import EnhancedProductTile from "@/components/enhanced-product-tile";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const CATEGORY_TITLES: Record<string, string> = {
  "trending-now": "Trending Now",
  "home-essentials": "Home Essentials",
  "the-latest": "The Latest",
  "new-launch": "New Launch",
  cosplay: "Cosplay",
  figurine: "Figurine",
  "household-utilities": "Household Utilities",
  keychains: "Keychains",
  kits: "Kits",
  lamps: "Lamps",
  personalised: "Personalised",
  statues: "Statues",
  utilities: "Utilities",
  "wall-decor": "Wall Decor",
};

const CATEGORY_MAPPINGS: Record<string, string> = {
  "trending-now": "Trending-Now",
  "home-essentials": "Home-Essentials",
  "the-latest": "The-Latest",
  "new-launch": "New-Launch",
  cosplay: "Cosplay",
  figurine: "Figurine",
  "household-utilities": "Household-Utilities",
  keychains: "Keychains",
  kits: "Kits",
  lamps: "Lamps",
  personalised: "Personalised",
  statues: "Statues",
  utilities: "Utilities",
  "wall-decor": "Wall-Decor",
};

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getProducts(category: string) {
  const mappedCategory = CATEGORY_MAPPINGS[category];
  if (!mappedCategory) {
    return null;
  }

  const products = await prisma.prebuiltProduct.findMany({
    where: { category: mappedCategory },
    include: {
      sizes: true,
      colors: true,
    },
  });

  if (!products || products.length === 0) {
    return null;
  }

  return products;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const title = CATEGORY_TITLES[category] || "Category";
  return {
    title: `${title} | Scribbl3D`,
    description: `Explore our ${title.toLowerCase()} products at Scribbl3D`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!CATEGORY_TITLES[category]) {
    notFound();
  }

  const products = await getProducts(category);
  const title = CATEGORY_TITLES[category];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: CATEGORY_TITLES[category], href: `/${category}` },
  ];

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 mt-[70px]">
      <div className="space-y-4 sm:space-y-6">
        <Link
          href="/"
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
          Go Back
        </Link>
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            <div className="h-3 w-1 bg-gray-300"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full leading-normal m-1">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 justify-items-center">
          {products.map((product) => (
            <EnhancedProductTile
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.sizes[0]?.price || product.price}
              originalPrice={
                product.sizes[0]?.originalPrice || product.originalPrice
              }
              images={product.images}
              description={product.description}
              isCustomizable={product.isCustomizable}
              availableSizes={product.sizes.map((size) => size.name)}
              isPrebuilt={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
