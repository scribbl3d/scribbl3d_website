import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import sendStatusEmail from "./sendStatusEmail";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

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