// app/api/admin/shipments/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const shipments = await prisma.shipment.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
        });
        return NextResponse.json({ ok: true, shipments });
    } catch (err: any) {
        console.error("ADMIN LIST ERROR:", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
