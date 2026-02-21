import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/* ───────── Helpers ───────── */

function getFinancialYear() {
    const now = new Date();
    const year =
        now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${String(year + 1).slice(-2)}`;
}

async function generateCreditNoteNumber(tx: Prisma.TransactionClient) {
    const fy = getFinancialYear();

    const counter = await tx.documentCounter.upsert({
        where: { key: "credit_note" },
        update: { lastNo: { increment: 1 } },
        create: { key: "credit_note", lastNo: 1 },
    });

    return `CN/SCR/${fy}/${String(counter.lastNo).padStart(6, "0")}`;
}

async function generateInvoiceNumber(tx: Prisma.TransactionClient) {
    const fy = getFinancialYear();

    const counter = await tx.documentCounter.upsert({
        where: { key: "invoice" },
        update: { lastNo: { increment: 1 } },
        create: { key: "invoice", lastNo: 1 },
    });

    return `SCR/${fy}/${String(counter.lastNo).padStart(6, "0")}`;
}

/* ───────── ROUTE ───────── */

export async function POST(req: NextRequest) {
    try {
        const { orderId, invoiceId, amount, reason } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid credit note amount" },
                { status: 400 },
            );
        }

        const creditNote = await db.$transaction(async (tx) => {
            let invoice: Prisma.InvoiceGetPayload<{}> | null = null;

            // 1️⃣ If invoiceId is provided, try that first
            if (invoiceId) {
                invoice = await tx.invoice.findUnique({
                    where: { id: invoiceId },
                });
            }

            // 2️⃣ If still not found, try finding by orderId (CRITICAL FIX)
            if (!invoice && orderId) {
                invoice = await tx.invoice.findUnique({
                    where: { orderId },
                });
            }

            // 3️⃣ If invoice STILL does not exist → create it
            if (!invoice) {
                if (!orderId) {
                    throw new Error("orderId is required to create invoice");
                }

                const order = await tx.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    throw new Error("Order not found");
                }

                const invoiceNumber = await generateInvoiceNumber(tx);

                invoice = await tx.invoice.create({
                    data: {
                        orderId: order.id,
                        invoiceNumber,
                        subtotal: order.subtotal || 0,
                        tax: order.tax || 0,
                        total: order.totalAmount,
                    },
                });
            }

            // 4️⃣ Create Credit Note
            const creditNoteNumber = await generateCreditNoteNumber(tx);

            const cn = await tx.creditNote.create({
                data: {
                    creditNoteNumber,
                    invoiceId: invoice.id,
                    amount,
                    reason,
                },
            });

            // 5️⃣ Mark invoice as adjusted
            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: "adjusted" },
            });

            return cn;
        });

        return NextResponse.json(creditNote);
    } catch (err: any) {
        console.error("Credit note creation error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to create credit note" },
            { status: 500 },
        );
    }
}
