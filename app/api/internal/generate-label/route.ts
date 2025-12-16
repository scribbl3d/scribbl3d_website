export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const waybill = searchParams.get("waybill");

    if (!waybill) {
        return NextResponse.json(
            { error: "waybill required" },
            { status: 400 }
        );
    }

    try {
        const delhiveryRes = await axios.get(
            "https://staging-express.delhivery.com/api/p/packing_slip",
            {
                params: {
                    wbns: waybill,
                    pdf: true,
                    pdf_size: "4R",
                },
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                },
            }
        );

        const pkg = delhiveryRes.data?.packages?.[0];

        if (!pkg) {
            return NextResponse.json(
                { error: "No package data returned by Delhivery" },
                { status: 500 }
            );
        }

        // ✅ BEST CASE: redirect to S3 PDF
        if (pkg.pdf_download_link) {
            return NextResponse.redirect(pkg.pdf_download_link);
        }

        // 🔁 FALLBACK: base64 encoded PDF
        if (pkg.pdf_encoding) {
            const pdfBuffer = Buffer.from(pkg.pdf_encoding, "base64");

            await prisma.shipment.updateMany({
                where: { waybill },
                data: {
                    labelGenerated: true,
                    labelGeneratedAt: new Date(),
                },
            });

            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `inline; filename="label-${waybill}.pdf"`,
                },
            });
        }

        return NextResponse.json(
            { error: "No label returned by Delhivery" },
            { status: 500 }
        );
    } catch (err: any) {
        console.error("Delhivery label error:", err?.response?.data || err);

        return NextResponse.json(
            { error: "Failed to generate label from Delhivery" },
            { status: 500 }
        );
    }
}

// curl --request POST \
// 	--url https://staging-express.delhivery.com/fm/request/new/ \
// 	--header 'Authorization: Token d1b522c71ffaf712a7500e2d23b7e2114f34799e' \
// 	--header 'Content-Type: application/json' \
// 	--data '
// {
//   "pickup_time": "11:00:00",
//   "pickup_date": "2025-12-29",
//   "pickup_location": "Scribbl SURFACE",
//   "expected_package_count": 1
// }
