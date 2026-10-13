import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

// Delhivery error bodies vary: { error: { message } }, { error: "..." },
// { message: "..." }, or field-keyed like { prepaid: "Client wallet balance..." }.
function delhiveryErrorMessage(data: unknown): string | undefined {
    if (!data) return undefined;
    if (typeof data === "string") return data;
    if (typeof data !== "object") return undefined;
    const d = data as Record<string, any>;
    const direct =
        d.error?.message ??
        (typeof d.error === "string" ? d.error : undefined) ??
        d.message ??
        d.rmk;
    if (typeof direct === "string" && direct) return direct;
    const fields = Object.values(d).filter(
        (v): v is string => typeof v === "string" && v.length > 0,
    );
    return fields.length ? fields.join(" ") : undefined;
}

export async function POST(req: Request) {
    const denied = await requireAdmin();
    if (denied) return denied;

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
            "https://track.delhivery.com/fm/request/new/",
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
            // Delhivery confirmed an existing pickup for this location/date
            // and did not create or change anything — the admin's just-
            // submitted pickup_time/expected_package_count are unconfirmed,
            // possibly different from the real existing schedule, so they
            // must not overwrite the real stored values. Only the confirmed
            // pickupId/status are safe to persist against an existing row.
            //
            // The `create` branch below only runs if no local row exists at
            // all (e.g. a prior write failed after Delhivery already had a
            // pickup for this location/date) — there, there's nothing
            // locally-stored to protect, and the admin's current submission
            // is the only information available, so it's used as a
            // best-effort record until it can be reconciled against
            // Delhivery's real schedule.
            await prisma.pickupRequest.upsert({
                where: {
                    pickupLocation_pickupDate: {
                        pickupLocation: pickup_location,
                        pickupDate: new Date(pickup_date),
                    },
                },
                update: {
                    pickupId: data.pickup_id,
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
                    "A pickup is already scheduled for this location on this date. The existing schedule was not changed — the time and package count you just submitted were not applied.",
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

        const upstreamStatus = err?.response?.status;
        return NextResponse.json(
            {
                ok: false,
                error:
                    delhiveryErrorMessage(err?.response?.data) ||
                    "Delhivery pickup request failed",
            },
            {
                status:
                    upstreamStatus >= 400 && upstreamStatus < 500 ? 400 : 500,
            },
        );
    }
}
