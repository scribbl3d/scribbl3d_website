import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const carouselItemSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().url(),
  duration: z.number().int().positive(),
});

export async function GET() {
  try {
    const items = await prisma.carouselItem.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch carousel items:", error);
    return NextResponse.json({ error: "Failed to fetch carousel items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = carouselItemSchema.parse(body);

    const item = await prisma.carouselItem.create({
      data: validatedData,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to create carousel item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create carousel item" }, { status: 500 });
  }
}

