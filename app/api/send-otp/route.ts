import { getClientIdentifier } from "@/lib/api-helpers";
import { normaliseEmail } from "@/lib/auth/registrationToken";
import { OTP_CONFIG, getOTPEmailTemplate } from "@/lib/otp-config";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/sendEmail";
import { hash } from "bcryptjs";
import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_PER_EMAIL_PER_HOUR = 5;

function generateOTP() {
    return randomInt(100000, 1000000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        const parsed = z.string().trim().email().max(254).safeParse(body?.email);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 },
            );
        }
        const email = normaliseEmail(parsed.data);

        // Apply rate limiting (per IP)
        const { success } = await rateLimit(`send-otp:ip:${getClientIdentifier(req)}`, 10, 60 * 60 * 1000);
        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429 },
            );
        }

        // Per-email cooldown and hourly cap (stops inbox flooding from many IPs)
        const recent = await prisma.onetimep.findMany({
            where: { email, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
        });
        if (
            recent.length >= MAX_PER_EMAIL_PER_HOUR ||
            (recent[0] && Date.now() - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS)
        ) {
            return NextResponse.json(
                { error: "Please wait before requesting another OTP." },
                { status: 429 },
            );
        }

        const otp = generateOTP();
        const hashedOtp = await hash(otp, 10);
        const expiresAt = new Date(
            Date.now() + OTP_CONFIG.OTP.EXPIRY_MINUTES * 60 * 1000,
        );

        let otpId: string;
        try {
            const created = await prisma.onetimep.create({
                data: {
                    email,
                    otp: hashedOtp,
                    expiresAt,
                },
                select: { id: true },
            });
            otpId = created.id;
        } catch (dbError) {
            console.error("[send-otp] Database error:", dbError instanceof Error ? dbError.message : dbError);
            return NextResponse.json(
                { error: "Failed to send OTP" },
                { status: 500 },
            );
        }

        // Send OTP via ZeptoMail
        const emailResult = await sendEmail({
            to: email,
            subject: OTP_CONFIG.EMAIL.SUBJECT,
            html: getOTPEmailTemplate(otp, "register"),
        });

        if (!emailResult.ok) {
            console.error("[send-otp] Email send failed");

            // Remove this OTP since it was never delivered
            await prisma.onetimep.deleteMany({
                where: { id: otpId },
            });

            return NextResponse.json(
                { error: "Failed to send OTP email" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("[send-otp] Error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: "Failed to process OTP request" },
            { status: 500 },
        );
    }
}
