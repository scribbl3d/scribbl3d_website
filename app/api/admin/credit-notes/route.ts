import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
    generateCreditNoteNumber,
    generateInvoiceNumber,
    isUniqueViolation,
} from "@/lib/invoice/numbering";

/* ───────── ROUTE ───────── */

class CreditNoteError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

export async function POST(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        // The amount is never taken from the client: it is the invoice total.
        const { orderId, invoiceId, reason } = await req.json();

        const run = () =>
            db.$transaction(async (tx) => {
                let invoice: Prisma.InvoiceGetPayload<{}> | null = null;

                if (invoiceId) {
                    invoice = await tx.invoice.findUnique({
                        where: { id: invoiceId },
                    });
                }
                if (!invoice && orderId) {
                    invoice = await tx.invoice.findUnique({
                        where: { orderId },
                    });
                }

                const order = await tx.order.findUnique({
                    where: { id: invoice?.orderId ?? orderId ?? "" },
                });
                if (!order) throw new CreditNoteError("Order not found", 404);

                // Credit notes only follow a cancelled / refunded order.
                if (order.status !== "cancelled" && !order.refundId) {
                    throw new CreditNoteError(
                        "A credit note can only be issued for a cancelled or refunded order",
                        409,
                    );
                }

                if (!invoice) {
                    invoice = await tx.invoice.create({
                        data: {
                            orderId: order.id,
                            invoiceNumber: await generateInvoiceNumber(tx),
                            subtotal: order.subtotal || 0,
                            tax: order.tax || 0,
                            total: order.totalAmount,
                        },
                    });
                }

                // One full credit note per invoice: repeat calls return it.
                const existing = await tx.creditNote.findFirst({
                    where: { invoiceId: invoice.id },
                    orderBy: { issuedAt: "asc" },
                });
                if (existing) return existing;

                if (!(invoice.total > 0)) {
                    throw new CreditNoteError("Nothing to credit", 409);
                }

                const cn = await tx.creditNote.create({
                    data: {
                        creditNoteNumber: await generateCreditNoteNumber(tx),
                        invoiceId: invoice.id,
                        amount: invoice.total,
                        reason:
                            typeof reason === "string" && reason.trim()
                                ? reason.trim().slice(0, 500)
                                : "Order cancelled / refund issued",
                    },
                });

                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { status: "adjusted" },
                });

                return cn;
            });

        let creditNote;
        try {
            creditNote = await run();
        } catch (err) {
            // A concurrent request created the invoice first: retry once.
            if (!isUniqueViolation(err)) throw err;
            creditNote = await run();
        }

        return NextResponse.json(creditNote);
    } catch (err) {
        if (err instanceof CreditNoteError) {
            return NextResponse.json(
                { error: err.message },
                { status: err.status },
            );
        }
        console.error("Credit note creation error:", err);
        return NextResponse.json(
            { error: "Failed to create credit note" },
            { status: 500 },
        );
    }
}
