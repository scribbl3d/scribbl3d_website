import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { updateEmail } from "@/app/actions/profile-actions";
import { z } from "zod";

const updateEmailSchema = z.object({
  newEmail: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newEmail } = updateEmailSchema.parse(body);

    const result = await updateEmail(newEmail);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to update email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating email:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}
