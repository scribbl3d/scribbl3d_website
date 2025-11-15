import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }
    const count = await prisma.prebuiltProduct.count({
      where: { category },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to fetch product count:", error);
    return NextResponse.json(
      { error: "Failed to fetch product count" },
      { status: 500 }
    );
  }
}
