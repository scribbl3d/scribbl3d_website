// app/api/orders/[orderId]/invoice/route.ts
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import crypto from "crypto";
import fs from "fs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

/* ────────────────────── Helpers ────────────────────── */

function fmtINR(n: number): string {
    return `Rs ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
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

    function twoDigits(n: number): string {
        if (n < 20) return ones[n];
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }
    function threeDigits(n: number): string {
        if (n >= 100)
            return (
                ones[Math.floor(n / 100)] +
                " Hundred" +
                (n % 100 ? " " + twoDigits(n % 100) : "")
            );
        return twoDigits(n);
    }

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

/* ────────────────────── Colors ────────────────────── */

// Matching the original invoice blue
const BLUE: [number, number, number] = [2, 136, 177]; // #0288B1
const DARK: [number, number, number] = [16, 24, 40];
const GRAY: [number, number, number] = [100, 100, 100];

/* ────────────────────── Route ────────────────────── */

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });

        if (!order || order.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 },
            );
        }

        // Parse order data
        const items: any[] =
            typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items || [];

        const billingAddress =
            typeof order.billingAddress === "string"
                ? JSON.parse(order.billingAddress)
                : order.billingAddress || {};
        const shippingAddress =
            typeof order.shippingAddress === "string"
                ? JSON.parse(order.shippingAddress)
                : order.shippingAddress || {};

        const addr = billingAddress?.fullName
            ? billingAddress
            : shippingAddress;
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

        // Invoice metadata
        const invoiceDate = new Date(order.createdAt);
        const dd = String(invoiceDate.getDate()).padStart(2, "0");
        const mm = String(invoiceDate.getMonth() + 1).padStart(2, "0");
        const yyyy = String(invoiceDate.getFullYear());
        const invoiceDateStr = `${dd}-${mm}-${yyyy}`;
        const orderHash = crypto
            .createHash("md5")
            .update(order.id)
            .digest("hex")
            .slice(0, 4)
            .toUpperCase();
        const invoiceNo = `SCR-${yyyy}${mm}-${orderHash}`;

        // Pricing from DB
        const subtotal = order.subtotal || 0;
        const discount = order.discountAmount || 0;
        const tax = order.tax || 0;
        const shippingCost = order.shippingPrice || 0;
        const grandTotal = order.totalAmount || 0;

        // Place of supply is always Delhi (company location)
        const placeOfSupply = "07-Delhi";

        // Customer state for determining SGST+CGST vs IGST
        const stateLower = customerState.toLowerCase().trim();
        const isIntraState =
            stateLower === "delhi" || stateLower === "new delhi";
        const cgst = isIntraState ? tax / 2 : 0;
        const sgst = isIntraState ? tax / 2 : 0;
        const igst = isIntraState ? 0 : tax;

        // Customer state code for display
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
        const customerStateCode = STATE_CODES[stateLower] || customerState;

        // Load images
        const logoBase64 = loadImageAsBase64("invoice/Tax_Logo.png");
        const signBase64 = loadImageAsBase64("invoice/Tax_Sign.jpg.jpeg");

        // ══════════════════════════════════════════
        //  GENERATE PDF
        // ══════════════════════════════════════════
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });
        const pageW = doc.internal.pageSize.getWidth();
        const ml = 14;
        const mr = 14;
        const rightEdge = pageW - mr;
        let y = 14;

        // ── COMPANY HEADER ──

        // Logo top-right (large and visible)
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, "PNG", rightEdge - 55, y - 4, 55, 22);
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
        const companyLines = [
            "Plot No- 685 Behind MCD Primary School, Saini Mohalla,",
            "Nangloi Delhi- 41",
            "Phone no. : 9599523434",
            "Email : Scribbl3dofficial@gmail.com",
            "GSTIN : 07BVCPJ4441C1Z1",
            "State: 07-Delhi",
        ];
        for (const line of companyLines) {
            doc.text(line, ml, y);
            y += 3.8;
        }

        // Blue divider
        y += 3;
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(1.2);
        doc.line(ml, y, rightEdge, y);
        y += 12;

        // ── TAX INVOICE TITLE ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...BLUE);
        const titleText = "Tax Invoice";
        const titleW = doc.getTextWidth(titleText);
        doc.text(titleText, (pageW - titleW) / 2, y);
        y += 14;

        // ── BILL TO + INVOICE DETAILS ──

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text("Bill To", ml, y);
        doc.text("Invoice Details", rightEdge, y, { align: "right" });
        y += 6;

        // Customer name (bold, uppercase like original)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text(customerName, ml, y);
        y += 5; // ← advance past name

        // Right column details (fixed positions, starting from name line)
        const rightDetailsY = y - 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text(`Invoice No. : ${invoiceNo}`, rightEdge, rightDetailsY, {
            align: "right",
        });
        doc.text(`Date : ${invoiceDateStr}`, rightEdge, rightDetailsY + 5.5, {
            align: "right",
        });
        doc.text(
            `Place of supply: ${placeOfSupply}`,
            rightEdge,
            rightDetailsY + 11,
            { align: "right" },
        );

        // Left: Address lines (auto-wrapped)
        const addrMaxW = pageW / 2 - ml - 5;
        const addressParts = [
            customerStreet,
            [customerCity, customerState].filter(Boolean).join(", ") +
                (customerPincode ? ` - ${customerPincode}` : ""),
            customerCountry,
        ].filter((l) => l && l.trim());

        for (const part of addressParts) {
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

        // Ensure y is below the right column details too
        y = Math.max(y, rightDetailsY + 16);
        y += 6;

        // ── ITEMS TABLE ──
        // Price in DB is GST-inclusive. Reverse calculate base price and GST.
        const GST_RATE = 18; // 18% GST
        const gstMultiplier = GST_RATE / 100;

        const tableRows = items.map((item: any, idx: number) => {
            const qty = item.quantity || 1;
            const inclusivePrice = item.price || 0; // price per unit (GST inclusive)
            const inclusiveLineTotal = inclusivePrice * qty;

            // Reverse: basePrice = inclusivePrice / (1 + gstRate)
            const basePrice =
                Math.round((inclusivePrice / (1 + gstMultiplier)) * 100) / 100;
            const gstPerUnit =
                Math.round((inclusivePrice - basePrice) * 100) / 100;
            const lineGst = Math.round(gstPerUnit * qty * 100) / 100;
            const lineBase = Math.round(basePrice * qty * 100) / 100;

            return {
                data: [
                    String(idx + 1),
                    item.name || "Item",
                    item.hsn || "3916",
                    String(qty),
                    "Box",
                    fmtINR(basePrice),
                    `${fmtINR(lineGst)}\n(${GST_RATE}%)`,
                    fmtINR(inclusiveLineTotal),
                ],
                basePrice: lineBase,
                gst: lineGst,
                total: inclusiveLineTotal,
                qty,
            };
        });

        const totalQty = tableRows.reduce((s, i) => s + i.qty, 0);
        const totalGst = tableRows.reduce((s, i) => s + i.gst, 0);
        const totalAmt = tableRows.reduce((s, i) => s + i.total, 0);

        autoTable(doc, {
            startY: y,
            margin: { left: ml, right: mr },
            head: [
                [
                    "#",
                    "Item name",
                    "HSN/\nSAC",
                    "Quantity",
                    "Unit",
                    "Price/ Unit",
                    "GST",
                    "Amount",
                ],
            ],
            body: tableRows.map((r) => r.data),
            foot: [
                [
                    "",
                    "Total",
                    "",
                    String(totalQty),
                    "",
                    "",
                    fmtINR(totalGst),
                    fmtINR(totalAmt),
                ],
            ],
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
                0: { cellWidth: 12 },
                1: { cellWidth: 48 },
                2: { cellWidth: 20 },
                3: { cellWidth: 22 },
                4: { cellWidth: 16 },
                5: { cellWidth: 22 },
                6: { cellWidth: 22 },
                7: { cellWidth: 20 },
            },
            // Minimal theme like original: header bar, thin row borders, bold footer border
            theme: "plain",
            styles: {
                overflow: "linebreak",
            },
            didParseCell: (data: any) => {
                const col = data.column.index;
                // All cells center aligned
                data.cell.styles.halign = "center";
                // Item name left aligned
                if (col === 1) data.cell.styles.halign = "left";

                // Header: white text on blue
                if (data.section === "head") {
                    data.cell.styles.fillColor = BLUE;
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = "bold";
                }

                // Body: thin bottom border
                if (data.section === "body") {
                    data.cell.styles.lineColor = [220, 220, 220];
                    data.cell.styles.lineWidth = {
                        bottom: 0.3,
                        top: 0,
                        left: 0,
                        right: 0,
                    };
                }

                // Footer: bold top border, no fill
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

        // ── BOTTOM SECTION ──
        const leftX = ml;
        const sumX = pageW / 2 + 5;
        const sumRight = pageW - mr; // right edge within margin
        let leftY = y;
        let sY = y;

        // ─ Right: Pricing Summary ─
        // Use reverse-calculated values from the table
        const invoiceSubtotal = tableRows.reduce((s, i) => s + i.basePrice, 0);
        const invoiceGst = totalGst;

        const drawRow = (
            label: string,
            value: string,
            opts?: { highlight?: boolean },
        ) => {
            if (opts?.highlight) {
                doc.setFillColor(...BLUE);
                doc.rect(sumX, sY - 3.5, sumRight - sumX, 7, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
            } else {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(...GRAY);
            }
            doc.text(label, sumX + 2, sY);
            doc.text(value, sumRight - 2, sY, { align: "right" });
            sY += opts?.highlight ? 8 : 6;
        };

        drawRow("Sub Total", fmtINR(invoiceSubtotal));
        if (isIntraState) {
            drawRow("SGST@9%", fmtINR(invoiceGst / 2));
            drawRow("CGST@9%", fmtINR(invoiceGst / 2));
        } else {
            drawRow("IGST@18%", fmtINR(invoiceGst));
        }
        if (discount > 0) {
            drawRow(
                `Discount${order.discountCode ? ` (${order.discountCode})` : ""}`,
                `-${fmtINR(discount)}`,
            );
        }
        if (shippingCost > 0) {
            drawRow("Shipping", fmtINR(shippingCost));
        }
        sY += 1;
        drawRow("Total", fmtINR(grandTotal), { highlight: true });
        drawRow("Received", fmtINR(grandTotal));
        drawRow("Balance", fmtINR(0));

        // Thin line after balance
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(sumX, sY - 3, sumRight, sY - 3);

        // ─ Left: Amount in Words ─
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...DARK);
        doc.text("Invoice Amount In Words", leftX, leftY);
        leftY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text(amountInWords(grandTotal), leftX, leftY);
        leftY += 10;

        // T&C
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK);
        doc.text("Terms and Conditions", leftX, leftY);
        leftY += 6;

        const tcMaxW = pageW / 2 - ml - 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);

        const drawWrappedLine = (text: string, spacing = 3.2) => {
            const lines = doc.splitTextToSize(text, tcMaxW);
            doc.text(lines, leftX, leftY);
            leftY += lines.length * spacing + 1;
        };

        // General terms
        let termNum = 1;
        drawWrappedLine(
            `${termNum}) Taxes: Prices are subject to applicable taxes (SGST @9%, CGST @9% or IGST, as applicable).`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Freight Charges: Freight and shipping charges are billed separately unless stated otherwise.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Payment Terms: All orders require 100% advance payment.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Order Confirmation: Order confirmation will be acknowledged via email.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Claims & Proof: Refund or replacement requests will not be processed without valid supporting proof.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Jurisdiction: All disputes are subject to Delhi jurisdiction only.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Handling Compliance: Refund or replacement claims may be declined if basic handling or usage instructions are violated.`,
        );
        termNum++;
        drawWrappedLine(
            `${termNum}) Shipping Damage: Any transit-related damage must be reported immediately upon unboxing.`,
        );
        termNum++;

        // Category-specific terms (continue numbering)
        const itemTypes = new Set(
            items.map((item: any) =>
                (item.itemType || "product").toLowerCase(),
            ),
        );

        if (itemTypes.has("printer")) {
            drawWrappedLine(
                `${termNum}) Printers carry a brand-provided warranty, with coverage varying by individual components.`,
            );
            termNum++;
        }
        if (itemTypes.has("filament")) {
            drawWrappedLine(
                `${termNum}) For partially or fully used filaments, customers must contact customer support for evaluation of any issues.`,
            );
            termNum++;
        }
        if (itemTypes.has("resin")) {
            drawWrappedLine(
                `${termNum}) No refunds or replacements will be entertained if the seal of the resin bottle is broken or tampered with.`,
            );
            termNum++;
        }
        if (itemTypes.has("product") || itemTypes.has("prebuilt")) {
            drawWrappedLine(
                `${termNum}) Personalised products are eligible only for damage or deviation from the approved request; no refunds or replacements provided otherwise.`,
            );
            termNum++;
        }

        // Footer disclaimer
        leftY += 3;
        doc.setFontSize(6.5);
        doc.setTextColor(130, 130, 130);
        const footerLines = doc.splitTextToSize(
            "Refunds, replacements, and warranties are subject to product condition, verification, and applicable brand or gateway policies.",
            tcMaxW,
        );
        doc.text(footerLines, leftX, leftY);

        // ─ Signatory (right side, centered) ─
        const sigStartY = sY + 4;
        const sigCenterX = sumX + (sumRight - sumX) / 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        const forText = "For :SCRIBBL3D";
        const forW = doc.getTextWidth(forText);
        doc.text(forText, sigCenterX - forW / 2, sigStartY);

        // Signature image (centered)
        if (signBase64) {
            try {
                const sigImgW = 35;
                const sigImgH = 18;
                doc.addImage(
                    signBase64,
                    "JPEG",
                    sigCenterX - sigImgW / 2,
                    sigStartY + 3,
                    sigImgW,
                    sigImgH,
                );
            } catch {}
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        const authText = "Authorized Signatory";
        const authW = doc.getTextWidth(authText);
        doc.text(authText, sigCenterX - authW / 2, sigStartY + 25);

        // ── Output ──
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Invoice_${invoiceNo}.pdf"`,
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
