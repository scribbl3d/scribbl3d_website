import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const isAuthenticated = () => {
  return true;
};

const blogSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  description: z.string().min(1).max(500),
  keywords: z.string().max(255),
  thumbnailImage: z.string().min(1), // Only require a string (file path), not a URL
  heroImage: z.string().min(1), // Only require a string (file path), not a URL
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
    });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validatedData = blogSchema.parse(body);
    const blog = await prisma.blog.update({
      where: { id },
      data: validatedData,
    });
    return NextResponse.json(blog);
  } catch (error) {
    console.error("Failed to update blog:", error);
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
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.blog.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Failed to delete blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
