import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Warm up database connection
        await prisma.$queryRaw`SELECT 1`;

        // Check PhonePe credentials exist
        const phonePeReady = !!(
            process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY
        );

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: "connected",
            phonepe: phonePeReady ? "configured" : "missing credentials",
        });
    } catch (error) {
        console.error("[Health] Error:", error);
        return NextResponse.json(
            { status: "unhealthy", error: (error as Error).message },
            { status: 500 },
        );
    }
}
