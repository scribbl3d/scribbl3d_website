import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            pickup_date,
            pickup_time,
            pickup_location,
            expected_package_count,
        } = body;

        /* ---------------- VALIDATION ---------------- */
        if (
            !pickup_date ||
            !pickup_time ||
            !pickup_location ||
            !expected_package_count
        ) {
            return NextResponse.json(
                { ok: false, error: "Missing required pickup fields" },
                { status: 400 },
            );
        }

        /* ---------------- CALL DELHIVERY ---------------- */
        const delhiveryRes = await axios.post(
            "https://staging-express.delhivery.com/fm/request/new/",
            {
                pickup_date,
                pickup_time,
                pickup_location,
                expected_package_count: Number(expected_package_count),
            },
            {
                headers: {
                    Authorization: `Token ${process.env.DELHIVERY_TOKEN}`,
                    "Content-Type": "application/json",
                },
                timeout: 5000,
            },
        );

        const data = delhiveryRes.data;

        /* ---------------- PICKUP EXISTS (BUSINESS SUCCESS) ---------------- */
        if (data?.pr_exist) {
            await prisma.pickupRequest.upsert({
                where: {
                    pickupLocation_pickupDate: {
                        pickupLocation: pickup_location,
                        pickupDate: new Date(pickup_date),
                    },
                },
                update: {
                    pickupId: data.pickup_id,
                    pickupTime: pickup_time,
                    expectedPackageCount: Number(expected_package_count),
                    status: "scheduled",
                },
                create: {
                    pickupLocation: pickup_location,
                    pickupDate: new Date(pickup_date),
                    pickupTime: pickup_time,
                    expectedPackageCount: Number(expected_package_count),
                    pickupId: data.pickup_id,
                    status: "scheduled",
                },
            });

            return NextResponse.json({
                ok: true,
                alreadyExists: true,
                pickup_id: data.pickup_id,
                message:
                    data?.error?.message ||
                    data?.data?.message ||
                    "Pickup already scheduled for this warehouse",
            });
        }

        /* ---------------- GENUINE FAILURE ---------------- */
        if (data?.success === false) {
            return NextResponse.json(
                {
                    ok: false,
                    error:
                        data?.error?.message ||
                        "Failed to create pickup request",
                },
                { status: 400 },
            );
        }

        /* ---------------- PICKUP CREATED SUCCESSFULLY ---------------- */
        await prisma.pickupRequest.create({
            data: {
                pickupLocation: pickup_location,
                pickupDate: new Date(pickup_date),
                pickupTime: pickup_time,
                expectedPackageCount: Number(expected_package_count),
                pickupId: data.pickup_id,
                status: "scheduled",
            },
        });

        return NextResponse.json({
            ok: true,
            alreadyExists: false,
            pickup_id: data.pickup_id,
            message: "Pickup request created successfully",
        });
    } catch (err: any) {
        console.error("Pickup request error:", err?.response?.data || err);

        return NextResponse.json(
            {
                ok: false,
                error:
                    err?.response?.data?.error?.message ||
                    "Delhivery pickup request failed",
            },
            { status: 500 },
        );
    }
}
