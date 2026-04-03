import { OTP_CONFIG, getOTPEmailTemplate } from "@/lib/otp-config";
import { rateLimit } from "@/lib/rate-limit";
import sgMail from "@sendgrid/mail";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not set in the environment variables");
}

// Initialize SendGrid with API key
sgMail.setApiKey(apiKey);

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

        const msg = {
            to: email,
            from: OTP_CONFIG.EMAIL.FROM,
            subject: OTP_CONFIG.EMAIL.SUBJECT,
            html: getOTPEmailTemplate(otp, "register"),
        };

        try {
            const response = await sgMail.send(msg);
            console.log("SendGrid Response:", response[0].statusCode);

            return NextResponse.json({
                success: true,
                message: "OTP sent successfully",
            });
        } catch (sendGridError: any) {
            console.error("SendGrid Error:", {
                message: sendGridError.message,
                code: sendGridError.code,
                response: sendGridError.response?.body,
            });

            // Delete the OTP from database since email failed
            await prisma.onetimep.deleteMany({
                where: { email },
            });

            if (sendGridError.code === 401 || sendGridError.code === 403) {
                return NextResponse.json(
                    { error: "Email service configuration error" },
                    { status: 500 },
                );
            }

            return NextResponse.json(
                { error: "Failed to send OTP email" },
                { status: 500 },
            );
        }
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
