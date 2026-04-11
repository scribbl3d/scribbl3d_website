import { OTP_CONFIG, getOTPEmailTemplate } from "@/lib/otp-config";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/sendEmail";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received request body:", JSON.stringify(body));

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 },
            );
        }

        const { email } = body;

        console.log("Extracted email:", email);

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Valid email is required" },
                { status: 400 },
            );
        }

        // Apply rate limiting
        const identifier = req.headers.get("x-forwarded-for") || "unknown";
        const { success } = await rateLimit(identifier);
        if (!success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429 },
            );
        }

        const otp = generateOTP();
        const hashedOtp = await hash(otp, 10);
        const expiresAt = new Date(
            Date.now() + OTP_CONFIG.OTP.EXPIRY_MINUTES * 60 * 1000,
        );

        try {
            await prisma.onetimep.create({
                data: {
                    email,
                    otp: hashedOtp,
                    expiresAt,
                },
            });
        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json(
                { error: "Database error occurred" },
                { status: 500 },
            );
        }

        console.log(`Storing OTP for ${email}`);

        // Send OTP via AWS SES
        const emailResult = await sendEmail({
            to: email,
            subject: OTP_CONFIG.EMAIL.SUBJECT,
            html: getOTPEmailTemplate(otp, "register"),
        });

        if (!emailResult.ok) {
            console.error("Email send failed:", emailResult.error);

            // Delete the OTP from database since email failed
            await prisma.onetimep.deleteMany({
                where: { email },
            });

            return NextResponse.json(
                { error: "Failed to send OTP email" },
                { status: 500 },
            );
        }

        console.log("OTP email sent successfully via AWS SES");

        return NextResponse.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Error in OTP process:", error);

        let errorMessage = "An unknown error occurred";
        let errorDetails: Record<string, unknown> = {};

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = {
                name: error.name,
                stack: error.stack,
            };
            console.error("Error details:", JSON.stringify(errorDetails));
        } else {
            console.error("Non-Error object thrown");
        }

        return NextResponse.json(
            {
                error: "Failed to process OTP request",
                message: errorMessage,
                details: errorDetails,
            },
            { status: 500 },
        );
    } finally {
        await prisma.$disconnect();
    }
}