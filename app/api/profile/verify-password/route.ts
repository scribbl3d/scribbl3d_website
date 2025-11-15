import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const verifyPasswordSchema = z.object({
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = verifyPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found or password not set" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
