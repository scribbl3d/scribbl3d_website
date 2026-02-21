import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import fs from "fs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

/* ───────────────── Helpers ───────────────── */

function fmtINR(n: number): string {
    return `Rs ${new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n)}`;
}

function amountInWords(amount: number): string {
    const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];
    const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
    ];

    const twoDigits = (n: number): string =>
        n < 20
            ? ones[n]
            : tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");

    const threeDigits = (n: number): string =>
        n >= 100
            ? ones[Math.floor(n / 100)] +
              " Hundred" +
              (n % 100 ? " " + twoDigits(n % 100) : "")
            : twoDigits(n);

    let n = Math.round(amount);
    if (n === 0) return "Zero Rupees only";

    const parts: string[] = [];
    if (n >= 10000000) {
        parts.push(twoDigits(Math.floor(n / 10000000)) + " Crore");
        n %= 10000000;
    }
    if (n >= 100000) {
        parts.push(twoDigits(Math.floor(n / 100000)) + " Lakh");
        n %= 100000;
    }
    if (n >= 1000) {
        parts.push(twoDigits(Math.floor(n / 1000)) + " Thousand");
        n %= 1000;
    }
    if (n > 0) parts.push(threeDigits(n));

    return parts.join(" ") + " Rupees only";
}

function loadImageAsBase64(filePath: string): string | null {
    try {
        const absPath = path.join(process.cwd(), "public", filePath);
        const buffer = fs.readFileSync(absPath);
        const ext = filePath.toLowerCase().endsWith(".png") ? "png" : "jpeg";
        return `data:image/${ext};base64,${buffer.toString("base64")}`;
    } catch {
        return null;
    }
}

function formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}-${mm}-${yyyy}`;
}

function getFinancialYear(): string {
    const now = new Date();
    const year =
        now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${String(year + 1).slice(-2)}`;
}

/* ───────────────── Constants ───────────────── */

const STATE_CODES: Record<string, string> = {
    delhi: "07-Delhi",
    "new delhi": "07-Delhi",
    maharashtra: "27-Maharashtra",
    karnataka: "29-Karnataka",
    "tamil nadu": "33-Tamil Nadu",
    telangana: "36-Telangana",
    "uttar pradesh": "09-Uttar Pradesh",
    gujarat: "24-Gujarat",
    rajasthan: "08-Rajasthan",
    "west bengal": "19-West Bengal",
    jharkhand: "20-Jharkhand",
    bihar: "10-Bihar",
    "madhya pradesh": "23-Madhya Pradesh",
    haryana: "06-Haryana",
    punjab: "03-Punjab",
    "andhra pradesh": "37-Andhra Pradesh",
    kerala: "32-Kerala",
    goa: "30-Goa",
};

const BLUE: [number, number, number] = [2, 136, 177];
const DARK: [number, number, number] = [16, 24, 40];
const GRAY: [number, number, number] = [110, 110, 110];

// A4 content width = 210 - 14(left) - 14(right) = 182mm exactly
const COL_WIDTHS = {
    no: 10,
    name: 55,
    hsn: 22,
    qty: 20,
    price: 35,
    amount: 40,
} as const;
// 10 + 55 + 22 + 20 + 35 + 40 = 182 ✓

/* ───────────────── Route ───────────────── */

export async function GET(
    req: NextRequest,
    { params }: { params: { creditNoteId: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        /* ── Step 1: Load the invoice by the creditNoteId param ──
           The param could be either an actual creditNote.id OR an invoiceId
           depending on how your frontend calls this route.
           We handle both cases gracefully.                            */

        // Try direct creditNote lookup first
        let existingCreditNote = await db.creditNote.findUnique({
            where: { id: params.creditNoteId },
            include: {
                invoice: { include: { order: { include: { user: true } } } },
            },
        });

        // Fallback: maybe the param is an invoiceId
        if (!existingCreditNote) {
            existingCreditNote = await db.creditNote.findFirst({
                where: { invoiceId: params.creditNoteId },
                include: {
                    invoice: {
                        include: { order: { include: { user: true } } },
                    },
                },
            });
        }

        // If still not found, maybe param is an orderId — find via invoice
        let invoice;
        let order;

        if (existingCreditNote) {
            invoice = existingCreditNote.invoice;
            order = invoice.order;
        } else {
            // Last resort: treat param as orderId
            const foundInvoice = await db.invoice.findFirst({
                where: { orderId: params.creditNoteId },
                include: { order: { include: { user: true } } },
            });
            if (!foundInvoice) {
                return NextResponse.json(
                    { error: "Not found" },
                    { status: 404 },
                );
            }
            invoice = foundInvoice;
            order = foundInvoice.order;
        }

        // Auth check
        if (order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        /* ── Step 2: Idempotent credit note upsert ──
           ONE invoice → ONE credit note, guaranteed.
           findFirst on invoiceId, create only if missing.            */
        let creditNote = await db.creditNote.findFirst({
            where: { invoiceId: invoice.id },
        });

        if (!creditNote) {
            creditNote = await db.$transaction(async (tx) => {
                // Double-check inside transaction to avoid race condition
                const existing = await tx.creditNote.findFirst({
                    where: { invoiceId: invoice.id },
                });
                if (existing) return existing;

                const fy = getFinancialYear();
                const counter = await tx.documentCounter.upsert({
                    where: { key: "credit_note" },
                    update: { lastNo: { increment: 1 } },
                    create: { key: "credit_note", lastNo: 1 },
                });

                const creditNoteNumber = `CN/SCR/${fy}/${String(counter.lastNo).padStart(6, "0")}`;

                return tx.creditNote.create({
                    data: {
                        invoiceId: invoice.id,
                        creditNoteNumber,
                        amount: order.totalAmount,
                        reason: "Order cancelled / refund issued",
                        issuedAt: order.refundCompletedAt ?? new Date(),
                    },
                });
            });
        }

        const creditNoteNumber = creditNote.creditNoteNumber;
        const creditNoteDate = order.refundCompletedAt
            ? new Date(order.refundCompletedAt)
            : new Date(creditNote.issuedAt);
        const creditNoteDateStr = formatDate(creditNoteDate);

        /* ───────── Parse Address ───────── */

        const billing =
            typeof order.billingAddress === "string"
                ? JSON.parse(order.billingAddress)
                : order.billingAddress || {};

        const shipping =
            typeof order.shippingAddress === "string"
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress || {};

        const addr = billing?.fullName ? billing : shipping;

        const customerName = (
            addr?.fullName ||
            addr?.name ||
            order.user?.name ||
            "Customer"
        ).toUpperCase();
        const customerPhone = Array.isArray(addr?.phone)
            ? addr.phone[0]
            : addr?.phone || "";
        const customerStreet = addr?.address || addr?.street || "";
        const customerCity = addr?.city || "";
        const customerState = addr?.state || "";
        const customerPincode = addr?.pincode || addr?.zipCode || "";
        const customerCountry = addr?.country || "India";
        const customerGstin = addr?.gstin || null;

        const stateLower = customerState.toLowerCase().trim();
        const customerStateCode = STATE_CODES[stateLower] || customerState;
        const placeOfSupply = "07-Delhi"; // always Delhi

        /* ───────── Parse Items ───────── */

        const items: any[] =
            typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items || [];

        /* ───────── Pricing ───────── */

        const grandTotal = order.totalAmount || 0;
        const GST_RATE = 18;
        const gstMultiplier = GST_RATE / 100;

        const tableRows = items.map((item: any, idx: number) => {
            const qty = item.quantity || 1;
            const inclusivePrice = item.price || 0;
            const basePrice =
                Math.round((inclusivePrice / (1 + gstMultiplier)) * 100) / 100;
            const gstPerUnit =
                Math.round((inclusivePrice - basePrice) * 100) / 100;
            const lineGst = Math.round(gstPerUnit * qty * 100) / 100;
            const lineBase = Math.round(basePrice * qty * 100) / 100;
            const inclusiveTotal = inclusivePrice * qty;

            return {
                data: [
                    String(idx + 1),
                    item.name || "Item",
                    item.hsn || "—",
                    String(qty),
                    fmtINR(basePrice),
                    fmtINR(inclusiveTotal),
                ],
                basePrice: lineBase,
                gst: lineGst,
                total: inclusiveTotal,
                qty,
            };
        });

        const totalQty = tableRows.reduce((s, i) => s + i.qty, 0);
        const totalBase = tableRows.reduce((s, i) => s + i.basePrice, 0);
        const totalGst = tableRows.reduce((s, i) => s + i.gst, 0);
        const totalAmt = tableRows.reduce((s, i) => s + i.total, 0);

        const isIntraState =
            stateLower === "delhi" || stateLower === "new delhi";

        /* ───────── Load Images ───────── */

        const logoBase64 = loadImageAsBase64("invoice/Tax_Logo.png");
        const signBase64 = loadImageAsBase64("invoice/Tax_Sign.jpg.jpeg");

        /* ══════════════════════════════════════
           GENERATE PDF
        ══════════════════════════════════════ */

        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth(); // 210mm
        const ml = 14;
        const mr = 14;
        const right = pageW - mr; // 196mm
        let y = 14;

        /* ── Company Header ── */

        if (logoBase64) {
            try {
                doc.addImage(logoBase64, "PNG", right - 42, y - 2, 42, 17);
            } catch {}
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...DARK);
        doc.text("SCRIBBL3D", ml, y + 5);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);

        for (const line of [
            "Plot No- 685 Behind MCD Primary School, Saini Mohalla,",
            "Nangloi Delhi- 41",
            "Phone no. : 9599523434",
            "Email : Scribbl3dofficial@gmail.com",
            "GSTIN : 07BVCPJ4441C1Z1",
            "State: 07-Delhi",
        ]) {
            doc.text(line, ml, y);
            y += 3.8;
        }

        y += 4;
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(1.2);
        doc.line(ml, y, right, y);
        y += 12;

        /* ── Title ── */

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...BLUE);
        doc.text("Credit Note", pageW / 2, y, { align: "center" });
        y += 14;

        /* ── Return From / Return Details ── */

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text("Return From", ml, y);
        doc.text("Return Details", right, y, { align: "right" });
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(customerName, ml, y);

        const rightY = y;
        const rightPad = right - 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text(`Return No. : ${creditNoteNumber}`, rightPad, rightY, {
            align: "right",
        });
        doc.text(`Date : ${creditNoteDateStr}`, rightPad, rightY + 5.5, {
            align: "right",
        });
        doc.text(`Place of supply: ${placeOfSupply}`, rightPad, rightY + 11, {
            align: "right",
        });

        y += 5;

        const addrMaxW = pageW / 2 - ml - 5;

        for (const part of [
            customerStreet,
            [customerCity, customerState].filter(Boolean).join(", ") +
                (customerPincode ? ` - ${customerPincode}` : ""),
            customerCountry,
        ].filter((l) => l?.trim())) {
            const wrapped = doc.splitTextToSize(part, addrMaxW);
            doc.text(wrapped, ml, y);
            y += wrapped.length * 4;
        }

        if (customerPhone) {
            doc.text(`Contact No. : ${customerPhone}`, ml, y);
            y += 4.5;
        }
        if (customerGstin) {
            doc.text(`GSTIN : ${customerGstin}`, ml, y);
            y += 4.5;
        }
        if (customerStateCode) {
            doc.text(`State: ${customerStateCode}`, ml, y);
            y += 4.5;
        }

        y = Math.max(y, rightY + 16);
        y += 4;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text(
            `Cancelled against Invoice No: ${invoice.invoiceNumber}`,
            ml,
            y,
        );
        y += 9;

        /* ── Items Table ── */

        autoTable(doc, {
            startY: y,
            margin: { left: ml, right: mr },
            tableWidth: pageW - ml - mr, // explicit 182mm
            head: [
                [
                    "#",
                    "Item name",
                    "HSN/ SAC",
                    "Quantity",
                    "Price/ Unit",
                    "Amount",
                ],
            ],
            body: tableRows.map((r) => r.data),
            foot: [["", "Total", "", String(totalQty), "", fmtINR(totalAmt)]],
            headStyles: {
                fillColor: BLUE,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: "bold",
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            bodyStyles: {
                fontSize: 9,
                textColor: DARK,
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            footStyles: {
                textColor: DARK,
                fontSize: 9,
                fontStyle: "bold",
                cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            },
            columnStyles: {
                0: { cellWidth: COL_WIDTHS.no },
                1: { cellWidth: COL_WIDTHS.name },
                2: { cellWidth: COL_WIDTHS.hsn },
                3: { cellWidth: COL_WIDTHS.qty },
                4: { cellWidth: COL_WIDTHS.price },
                5: { cellWidth: COL_WIDTHS.amount },
            },
            theme: "plain",
            styles: { overflow: "linebreak" },
            didParseCell: (data: any) => {
                data.cell.styles.halign = "center";
                if (data.column.index === 1) data.cell.styles.halign = "left";

                if (data.section === "head") {
                    data.cell.styles.fillColor = BLUE;
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = "bold";
                }
                if (data.section === "body") {
                    data.cell.styles.lineColor = [220, 220, 220];
                    data.cell.styles.lineWidth = {
                        bottom: 0.3,
                        top: 0,
                        left: 0,
                        right: 0,
                    };
                }
                if (data.section === "foot") {
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.lineColor = [60, 60, 60];
                    data.cell.styles.lineWidth = {
                        top: 0.5,
                        bottom: 0.5,
                        left: 0,
                        right: 0,
                    };
                }
            },
        });

        y = (doc as any).lastAutoTable.finalY + 10;

        /* ── Bottom Section ── */

        const leftX = ml;
        const sumX = pageW / 2 + 5;
        const sumRight = right;
        const sumW = sumRight - sumX;
        let leftY = y;
        let sY = y;

        const drawRow = (label: string, value: string, highlight = false) => {
            const rowH = highlight ? 8 : 6.5;

            if (highlight) {
                doc.setFillColor(...BLUE);
                doc.rect(sumX, sY - 4.5, sumW, rowH + 1, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(...GRAY);
            }

            doc.text(label, sumX + 3, sY);
            doc.text(value, sumRight - 3, sY, { align: "right" });
            sY += rowH;
        };

        drawRow("Sub Total", fmtINR(totalBase));
        if (isIntraState) {
            drawRow("SGST @ 9%", fmtINR(totalGst / 2));
            drawRow("CGST @ 9%", fmtINR(totalGst / 2));
        } else {
            drawRow("IGST @ 18%", fmtINR(totalGst));
        }
        sY += 2;
        drawRow("Total", fmtINR(grandTotal), true);
        drawRow("Paid", fmtINR(grandTotal));
        drawRow("Balance", fmtINR(0));

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(sumX, sY - 1, sumRight, sY - 1);

        /* Left: Amount in words */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text("Amount in words", leftX, leftY);
        leftY += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        const wordsMaxW = sumX - ml - 4;
        const wordsLines = doc.splitTextToSize(
            amountInWords(grandTotal),
            wordsMaxW,
        );
        doc.text(wordsLines, leftX, leftY);

        /* ── Signatory ── */
        const sigStartY = sY + 6;
        const sigCenterX = sumX + sumW / 2;

        if (signBase64) {
            try {
                doc.addImage(
                    signBase64,
                    "JPEG",
                    sigCenterX - 19,
                    sigStartY,
                    38,
                    20,
                );
            } catch {}
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text("Authorized Signatory", sigCenterX, sigStartY + 25, {
            align: "center",
        });

        /* ── Output ── */

        const pdf = Buffer.from(doc.output("arraybuffer"));

        return new NextResponse(pdf, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="CreditNote_${creditNoteNumber}.pdf"`,
            },
        });
    } catch (err: any) {
        console.error("Credit note generation error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to generate credit note" },
            { status: 500 },
        );
    }
}
