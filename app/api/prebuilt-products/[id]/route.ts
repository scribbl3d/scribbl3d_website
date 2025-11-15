import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const product = await prisma.prebuiltProduct.findUnique({
      where: { id },
      include: {
        colors: true,
        sizes: true,
      },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Prebuilt product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch prebuilt product:", error);
    return NextResponse.json(
      { error: "Failed to fetch prebuilt product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const body = await request.json();
    const { sizes, ...rest } = body;

    // Fetch existing sizes from DB
    const existingSizes = await prisma.productSize.findMany({
      where: { prebuiltProductId: id },
    });
    const existingSizeIds = existingSizes.map((s) => s.id);
    const incomingSizeIds = sizes
      .filter((s: any) => s.id)
      .map((s: any) => s.id);
    const sizesToDelete = existingSizeIds.filter(
      (sid) => !incomingSizeIds.includes(sid)
    );

    const sizesUpdate: any = {};
    if (sizesToDelete.length) {
      sizesUpdate.deleteMany = { id: { in: sizesToDelete } };
    }
    if (sizes.some((s: any) => s.id)) {
      sizesUpdate.updateMany = sizes
        .filter((s: any) => s.id)
        .map((s: any) => ({
          where: { id: s.id },
          data: {
            name: s.name,
            price: s.price,
            originalPrice: s.originalPrice,
            sizeType: s.sizeType,
          },
        }));
    }
    if (sizes.some((s: any) => !s.id)) {
      sizesUpdate.create = sizes
        .filter((s: any) => !s.id)
        .map((s: any) => ({
          name: s.name,
          price: s.price,
          originalPrice: s.originalPrice,
          sizeType: s.sizeType,
        }));
    }

    const prebuiltProduct = await prisma.prebuiltProduct.update({
      where: { id },
      data: {
        ...rest,
        sizes: sizesUpdate,
      },
      include: { sizes: true },
    });
    return NextResponse.json(prebuiltProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  try {
    const product = await prisma.prebuiltProduct.delete({ where: { id: id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
