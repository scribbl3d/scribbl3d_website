import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  description: z.string().min(1).max(500),
  keywords: z.string().max(255),
  thumbnailImage: z.string().min(1), // Only require a string (file path), not a URL
  heroImage: z.string().min(1), // Only require a string (file path), not a URL
});

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ...rest } = body;

    const validatedData = blogSchema.parse(rest);

    const blog = await prisma.blog.create({
      data: validatedData,
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("Blog creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create blog post",
      },
      {
        status: 500,
      }
    );
  }
}
