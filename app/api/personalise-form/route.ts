import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email/index";
import {
  sanitize, sanitizeWithLimit, sanitizeOptional, sanitizeStringArray,
  isValidEmail, normalizeEmail, isValidPhone, normalizePhone,
  checkRequired, isRateLimited,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { isAware, categories, statueDetails, wantMore, contactDetails, userId } = body;

    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(`personalise:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Sanitize contact details
    const name = sanitizeWithLimit(contactDetails?.name, 200);
    const email = contactDetails?.email?.trim()?.toLowerCase() || "";
    const phone = String(contactDetails?.phone || "").trim();

    // Validate required contact fields
    const reqError = checkRequired([
      { value: name, name: "Name" },
      { value: email, name: "Email" },
      { value: phone, name: "Phone" },
    ]);
    if (reqError) {
      return NextResponse.json({ success: false, error: reqError }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number (10 digits required)" }, { status: 400 });
    }

    // Sanitize all inputs
    const cleanCategories = sanitizeStringArray(categories);
    const cleanStatueDetails = sanitizeWithLimit(statueDetails || "", 2000);
    const cleanIsAware = sanitize(isAware);
    const cleanWantMore = sanitize(wantMore);

    const formResponse = await prisma.personaliseFormResponse.create({
      data: {
        isAware: cleanIsAware,
        categories: cleanCategories,
        statueDetails: cleanStatueDetails,
        wantMore: cleanWantMore,
        name,
        email: normalizeEmail(email),
        phone: normalizePhone(phone),
        userId: typeof userId === "string" ? userId : null,
      },
    });

    // Fire-and-forget admin email notification
    console.log("[Admin Email] Attempting to send Personalise admin notification...");
    sendAdminNotification({
      type: "personalise-response",
      details: {
        "Name": contactDetails?.name || "—",
        "Email": contactDetails?.email || "—",
        "Phone": contactDetails?.phone || "—",
        "Aware of 3D Printing": isAware ? "Yes" : "No",
        "Categories": Array.isArray(categories) ? categories.join(", ") : String(categories || "—"),
        "Statue Details": statueDetails || "—",
        "Want More Info": wantMore ? "Yes" : "No",
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
