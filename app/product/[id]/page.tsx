import ProductPage from "@/components/product-page";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const product = await prisma.prebuiltProduct.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      sizes: true,
      colors: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Convert Date objects to ISO strings
  const formattedProduct = {
    ...product,
    reviews: product.reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    })),
  };

  return formattedProduct;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const id = (await params).id;
  const product = await getProduct(id);

  return {
    title: `${product.name} | Scribbl3D`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Scribbl3D`,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const id = (await params).id;
  const product = await getProduct(id);

  return (
    <div className="min-h-screen bg-white pt-4 flex flex-col items-center justify-center">
      <div className="max-w-[1440px] w-full pt-[150px] pb-8">
        <ProductPage {...product} />
      </div>
    </div>
  );
}
