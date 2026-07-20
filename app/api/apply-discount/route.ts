import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/api-helpers";
import { RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const VALID_DISCOUNT_CODES = {
  GET10OFF: 0.1, // 10% discount
};

const couponSchema = z.object({
  code: z.string()
    .min(3, "Coupon code too short")
    .max(50, "Coupon code too long")
    .regex(/^[A-Z0-9-_]+$/i, "Invalid coupon format"),
  cartTotal: z.number().min(0, "Invalid cart total").optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force (10 attempts per minute)
    const rateLimitResult = await applyRateLimit(
      req,
      RateLimits.COUPON.limit,
      RateLimits.COUPON.windowMs
    );
    
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, "Too many coupon attempts. Please try again later.");
    }

    // Validate request
    const body = await req.json();
    const validation = couponSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid coupon code format", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code } = validation.data;
    const upperCode = code.toUpperCase();

    if (upperCode in VALID_DISCOUNT_CODES) {
      return NextResponse.json({
        success: true,
        discount: VALID_DISCOUNT_CODES[upperCode as keyof typeof VALID_DISCOUNT_CODES],
        code: upperCode,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid discount code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error applying discount:", error);
    return NextResponse.json(
      { error: "Failed to apply discount" },
      { status: 500 }
    );
  }
}
