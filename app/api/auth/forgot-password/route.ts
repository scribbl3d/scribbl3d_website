import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendPasswordResetEmail,
  sendGoogleUserNotification,
} from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";
import { applyRateLimit, validateRequest } from "@/lib/api-helpers";
import { RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations/api-schemas";

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
    const validation = await validateRequest(req, forgotPasswordSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email } = validation.data;

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // Clean up any existing expired tokens
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      if (user.password.startsWith("google_")) {
        if (user.email) {
          await sendGoogleUserNotification(user.email);
        }
        return NextResponse.json({
          message: "Google account detected",
          isGoogleUser: true,
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      if (user.email) {
        await sendPasswordResetEmail(user.email, resetToken);
      }
    }

    // Always return a success response to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account exists with that email, a password reset link has been sent.",
      isGoogleUser: false,
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
