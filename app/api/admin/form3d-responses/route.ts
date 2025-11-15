import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const responses = await prisma.form3DResponse.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching Form3D responses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
