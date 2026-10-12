import { getClientIdentifier } from "@/lib/api-helpers";
import { createRegistrationToken, normaliseEmail } from "@/lib/auth/registrationToken";
import { rateLimit } from "@/lib/rate-limit";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? normaliseEmail(body.email) : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!email || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
            { error: "Email and OTP are required" },
            { status: 400 },
        );
    }

    // Apply rate limiting (per IP and per email)
    const [byIp, byEmail] = await Promise.all([
        rateLimit(`verify-otp:ip:${getClientIdentifier(req)}`, 10, 60 * 1000),
        rateLimit(`verify-otp:email:${email}`, 10, 15 * 60 * 1000),
    ]);
    if (!byIp.success || !byEmail.success) {
        return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429 },
        );
    }

    try {
        const otpRecord = await prisma.onetimep.findFirst({
            where: {
                email,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!otpRecord) {
            return NextResponse.json(
                {
                    error: "OTP expired or not found. Please request a new OTP.",
                },
                { status: 400 },
            );
        }

        // Count the attempt atomically before checking, so parallel guesses can't exceed the limit
        const attempt = await prisma.onetimep.updateMany({
            where: { id: otpRecord.id, attempts: { lt: MAX_ATTEMPTS } },
            data: { attempts: { increment: 1 } },
        });
        if (attempt.count === 0) {
            await prisma.onetimep.deleteMany({ where: { id: otpRecord.id } });
            return NextResponse.json(
                { error: "Too many attempts. Please request a new OTP." },
                { status: 400 },
            );
        }

        const isValidOtp = await compare(otp, otpRecord.otp);

        if (!isValidOtp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        // OTP is valid: single use, and every other code for this email is void
        await prisma.onetimep.deleteMany({ where: { email } });
        return NextResponse.json({
            success: true,
            message: "OTP verified successfully",
            registrationToken: createRegistrationToken(email),
        });
    } catch (error) {
        console.error("Error verifying OTP:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "Failed to verify OTP" },
            { status: 500 },
        );
    }
}
