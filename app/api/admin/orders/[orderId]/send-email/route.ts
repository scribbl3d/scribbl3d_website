import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import sendStatusEmail from "./sendStatusEmail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
sgMail.setApiKey(SENDGRID_API_KEY);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const { status, trackingInfo } = await req.json();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    await sendStatusEmail(order, status, trackingInfo);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending status email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
