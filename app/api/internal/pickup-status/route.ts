import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pickupLocation = searchParams.get("pickup_location");

    if (!pickupLocation) {
        return NextResponse.json(
            { ok: false, error: "pickup_location required" },
            { status: 400 },
        );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pickup = await prisma.pickupRequest.findFirst({
        where: {
            pickupLocation,
            pickupDate: {
                gte: today,
            },
        },
        orderBy: {
            pickupDate: "asc",
        },
    });

    if (!pickup) {
        return NextResponse.json({
            ok: true,
            scheduled: false,
        });
    }

    return NextResponse.json({
        ok: true,
        scheduled: true,
        pickupId: pickup.pickupId,
        pickupTime: pickup.pickupTime,
        pickupDate: pickup.pickupDate,
    });
}
