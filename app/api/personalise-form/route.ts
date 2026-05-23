import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      isAware,
      categories,
      statueDetails,
      wantMore,
      contactDetails,
      userId,
    } = body;
    const formResponse = await prisma.personaliseFormResponse.create({
      data: {
        isAware,
        categories,
        statueDetails,
        wantMore,
        name: contactDetails?.name,
        email: contactDetails?.email,
        phone: contactDetails?.phone,
        userId,
      },
    });

    // Fire-and-forget admin email notification
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
    }).catch((err) => console.error("[Admin Email] Personalise notification failed:", err));

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
