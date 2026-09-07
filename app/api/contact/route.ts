import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email/index";
import { isRateLimited } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(`contact:${ip}`, 3, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Phone validation (optional, but if provided must be valid)
    if (phone?.trim()) {
      const digits = phone.replace(/[\s\-+()]/g, "");
      if (!/^\d{10}$/.test(digits) && !/^91\d{10}$/.test(digits)) {
        return NextResponse.json(
          { error: "Invalid phone number. Enter a valid 10-digit number." },
          { status: 400 }
        );
      }
    }

    // Send admin notification email
    console.log("[Contact API] Sending email to admin...");
    console.log("[Contact API] Payload:", JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || "—", subject: subject.trim() }));

    const emailResult = await sendAdminNotification({
      type: "contact-form",
      details: {
        Name: name.trim(),
        Email: email.trim().toLowerCase(),
        Phone: phone?.trim() || "—",
        Subject: subject.trim(),
        Message: message.trim(),
      },
    });

    console.log("[Contact API] Email result:", JSON.stringify(emailResult));

    if (!emailResult?.ok) {
      console.error("[Contact API] Email send failed:", emailResult);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
