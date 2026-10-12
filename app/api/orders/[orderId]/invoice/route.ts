import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { verifyAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { generateInvoicePdfBuffer } from "@/lib/invoice/generateInvoicePdf";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

// A tax invoice (and its permanent number) only exists for a paid order;
// cancelled orders qualify only if they were paid and refunded.
const PAID_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

function isInvoiceable(order: { status: string; paymentReference: string | null; refundId: string | null }) {
    if (PAID_STATUSES.includes(order.status)) return true;
    return order.status === "cancelled" && !!order.paymentReference && !!order.refundId;
}

/* ────────────────────── Route ────────────────────── */

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await context.params;

    const session = await getServerSession(authOptions);
    const admin = await verifyAdminSession(req.cookies.get("admin_token")?.value);

    if (!session?.user && !admin) {
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
        if (!admin && order.userId !== session?.user?.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!isInvoiceable(order)) {
            return NextResponse.json(
                { error: "An invoice is available once the payment is confirmed" },
                { status: 409 },
            );
        }

        const { buffer, invoiceNumber } =
            await generateInvoicePdfBuffer(orderId);

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Invoice_${invoiceNumber}.pdf"`,
            },
        });
    } catch (err) {
        console.error("Invoice generation error:", { orderId, error: err instanceof Error ? err.message : err });
        return NextResponse.json(
            { error: "Failed to generate invoice" },
            { status: 500 },
        );
    }
}
