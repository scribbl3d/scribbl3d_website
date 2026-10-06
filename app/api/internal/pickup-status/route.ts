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

    const pickups = await prisma.pickupRequest.findMany({
        where: {
            pickupLocation,
            status: "scheduled",
            pickupDate: {
                gte: today,
            },
        },
        orderBy: {
            pickupDate: "asc",
        },
    });

    if (pickups.length === 0) {
        return NextResponse.json({
            ok: true,
            scheduled: false,
            pickups: [],
        });
    }

    const mapped = pickups.map((pickup) => ({
        pickupId: pickup.pickupId,
        pickupTime: pickup.pickupTime,
        pickupDate: pickup.pickupDate,
    }));

    return NextResponse.json({
        ok: true,
        scheduled: true,
        pickups: mapped,
        // Back-compat flat fields mirroring the earliest upcoming pickup,
        // for any consumer still expecting the pre-multi-pickup shape.
        pickupId: mapped[0].pickupId,
        pickupTime: mapped[0].pickupTime,
        pickupDate: mapped[0].pickupDate,
    });
}
