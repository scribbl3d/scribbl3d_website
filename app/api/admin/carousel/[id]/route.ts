import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const carouselItemSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().url(),
  duration: z.number().int().positive(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const item = await prisma.carouselItem.findUnique({
      where: { id },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Carousel item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to fetch carousel item:", error);
    return NextResponse.json(
      { error: "Failed to fetch carousel item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const validatedData = carouselItemSchema.parse(body);
    const id = (await params).id;
    const item = await prisma.carouselItem.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update carousel item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update carousel item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await prisma.carouselItem.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Carousel item deleted successfully" });
  } catch (error) {
    console.error("Failed to delete carousel item:", error);
    return NextResponse.json(
      { error: "Failed to delete carousel item" },
      { status: 500 }
    );
  }
}
