import { db } from "@/lib/db";

export async function cleanupExpiredTokens() {
  try {
    await db.user.updateMany({
      where: {
        resetTokenExpiry: {
          lt: new Date(),
        },
      },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
  }
}
