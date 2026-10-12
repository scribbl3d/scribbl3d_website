import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const responses = await prisma.form3DResponse.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(responses);
    } catch (error) {
        console.error("Error fetching Form3D responses:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}
