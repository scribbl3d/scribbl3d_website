import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { generateInvoicePdfBuffer } from "@/lib/invoice/generateInvoicePdf";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/* ────────────────────── Route ────────────────────── */

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await context.params;

    const session = await getServerSession(authOptions);
    const adminToken = req.cookies.get("admin_token")?.value;

    if (!session?.user && !adminToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        // ✅ Only restrict for USER (not admin)
        if (session?.user && order.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { buffer, invoiceNumber } =
            await generateInvoicePdfBuffer(orderId);

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Invoice_${invoiceNumber}.pdf"`,
            },
        });
    } catch (err: any) {
        console.error("Invoice generation error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to generate invoice" },
            { status: 500 },
        );
    }
}
