import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Handle CORS
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const id = searchParams.get("id");

  if (!category || !id) {
    return NextResponse.json(
      { error: "Category and ID are required" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const relatedProducts = await prisma.prebuiltProduct.findMany({
      where: {
        category: category,
        id: { not: id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        images: true,
        sizes: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
          },
        },
      },
    });

    // Ensure the response is properly formatted
    const formattedProducts = relatedProducts.map((product) => ({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
    }));

    return NextResponse.json(formattedProducts, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to load related products. Please try again later." },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
