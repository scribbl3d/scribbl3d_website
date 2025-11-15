import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  console.log("Received verification request:", { email });

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP are required" },
      { status: 400 }
    );
  }

  // Apply rate limiting
  const identifier = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = await rateLimit(identifier);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
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
        { error: "OTP expired or not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await prisma.onetimep.delete({ where: { id: otpRecord.id } });
      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    const isValidOtp = await compare(otp, otpRecord.otp);

    if (!isValidOtp) {
      await prisma.onetimep.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP is valid
    await prisma.onetimep.delete({ where: { id: otpRecord.id } });
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      {
        error: "Failed to verify OTP",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
