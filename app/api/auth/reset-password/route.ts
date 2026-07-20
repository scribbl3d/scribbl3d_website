import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { applyRateLimit, validateRequest } from "@/lib/api-helpers";
import { RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations/api-schemas";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting (5 requests per 15 minutes)
    const rateLimitResult = await applyRateLimit(
      req,
      RateLimits.AUTH.limit,
      RateLimits.AUTH.windowMs
    );
    
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, "Too many password reset attempts. Please try again later.");
    }

    // Validate request
    const validation = await validateRequest(req, resetPasswordSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { token, password } = validation.data;

    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Prevent using the same password as before
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as the old password." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete all sessions for this user to log them out from all devices
    await db.session.deleteMany({
      where: { userId: user.id },
    });

    // Update password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ 
      message: "Password reset successful. All active sessions have been logged out for security." 
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
