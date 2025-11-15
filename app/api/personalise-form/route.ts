import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      isAware,
      categories,
      statueDetails,
      wantMore,
      contactDetails,
      userId,
    } = body;
    const formResponse = await prisma.personaliseFormResponse.create({
      data: {
        isAware,
        categories,
        statueDetails,
        wantMore,
        name: contactDetails?.name,
        email: contactDetails?.email,
        phone: contactDetails?.phone,
        userId,
      },
    });
    return NextResponse.json({ success: true, data: formResponse });
  } catch (error) {
    console.error("Failed to create personalise form response:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create personalise form response" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = await prisma.personaliseFormResponse.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("Failed to fetch personalise form responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch personalise form responses" },
      { status: 500 }
    );
  }
}
