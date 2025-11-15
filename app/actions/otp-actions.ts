"use server";

import { db } from "@/lib/db";
import { generateOTP } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { OTP_CONFIG, getOTPEmailTemplate } from "@/lib/otp-config";

export async function sendOTP(action: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.email) {
      throw new Error("User not found or email is missing");
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + OTP_CONFIG.OTP.EXPIRY_MINUTES
    );

    // Delete any existing OTP for this user and action
    await db.oTP.deleteMany({
      where: {
        userId: user.id,
        action,
      },
    });

    // Create new OTP
    await db.oTP.create({
      data: {
        userId: user.id,
        token: otp,
        action,
        expiresAt,
        attempts: 0,
      },
    });

    // Send OTP via email
    const emailTemplate = getOTPEmailTemplate(otp, action);
    await sendEmail({
      to: user.email,
      subject: OTP_CONFIG.EMAIL.SUBJECT,
      html: emailTemplate,
      from: OTP_CONFIG.EMAIL.FROM,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

export async function verifyOTP(action: string, token: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const otp = await db.oTP.findUnique({
      where: {
        userId_action: {
          userId: session.user.id,
          action,
        },
      },
    });

    if (!otp) {
      throw new Error("OTP not found");
    }

    if (otp.expiresAt < new Date()) {
      await db.oTP.delete({ where: { id: otp.id } });
      throw new Error("OTP expired");
    }

    if (otp.token !== token) {
      const updatedOtp = await db.oTP.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      if (updatedOtp.attempts >= OTP_CONFIG.OTP.MAX_ATTEMPTS) {
        await db.oTP.delete({ where: { id: otp.id } });
        throw new Error("Too many failed attempts. Please request a new OTP.");
      }

      throw new Error("Invalid OTP");
    }

    await db.oTP.delete({ where: { id: otp.id } });

    return { success: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}
