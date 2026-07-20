import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email/index";
import { personaliseFormSchema } from "@/lib/validations/api-schemas";
import { applyRateLimit, validateRequest } from "@/lib/api-helpers";
import { RateLimits, createRateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 requests per hour)
    const rateLimitResult = await applyRateLimit(
      request,
      RateLimits.QUOTE.limit,
      RateLimits.QUOTE.windowMs
    );
    
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult, "Too many quote requests. Please try again later.");
    }

    // Validate request body with Zod
    const validation = await validateRequest(request, personaliseFormSchema);
    if (!validation.success) {
      return validation.error;
    }

    const validatedData = validation.data;

    // Create form response with validated data
    const formResponse = await prisma.personaliseFormResponse.create({
      data: {
        isAware: validatedData.urgency === "Rush" ? "Yes" : "No", // Map urgency to isAware for now
        categories: [validatedData.material], // Map material to categories
        statueDetails: validatedData.notes || "",
        wantMore: validatedData.urgency !== "Standard" ? "Yes" : "No",
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        userId: null, // Will be set if user is authenticated
      },
    });

    // Fire-and-forget admin email notification
    console.log("[Admin Email] Attempting to send Personalise admin notification...");
    sendAdminNotification({
      type: "personalise-response",
      details: {
        "Name": validatedData.name,
        "Email": validatedData.email,
        "Phone": validatedData.phone,
        "Quantity": validatedData.quantity.toString(),
        "Material": validatedData.material,
        "Finish Type": validatedData.finishType || "—",
        "Color": validatedData.color || "—",
        "Notes": validatedData.notes || "—",
        "Urgency": validatedData.urgency,
        "File URL": validatedData.fileUrl || "—",
      },
    }).then((res) => console.log("[Admin Email] Personalise notification result:", JSON.stringify(res)))
      .catch((err) => console.error("[Admin Email] Personalise notification failed:", err));

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
