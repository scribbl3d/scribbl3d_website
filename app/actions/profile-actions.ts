"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function updateEmail(newEmail: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error("Email is already in use");
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { email: newEmail },
    });

    await db.session.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
}
