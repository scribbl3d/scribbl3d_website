import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

// GET /api/admin/hero-images
export async function GET() {
  try {
    const heroImages = await prisma.heroImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(heroImages);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}

// POST /api/admin/hero-images
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const page = formData.get("page") as string;
    const alt = formData.get("alt") as string;

    if (!file || !page || !alt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uniqueId}.${fileExtension}`;

    // Save file to public directory
    const publicDir = join(process.cwd(), "public", "hero-images");
    const filePath = join(publicDir, fileName);
    await writeFile(filePath, buffer);

    // Save to database
    const heroImage = await prisma.heroImage.create({
      data: {
        id: uniqueId,
        page,
        imageUrl: `/hero-images/${fileName}`,
        alt,
      },
    });

    return NextResponse.json(heroImage);
  } catch (error) {
    console.error("Error uploading hero image:", error);
    return NextResponse.json(
      { error: "Failed to upload hero image" },
      { status: 500 }
    );
  }
}
