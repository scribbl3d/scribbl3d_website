import { sendEmail as sesEmail } from "@/lib/email/sendEmail";

// Default sender email
const DEFAULT_FROM_EMAIL =
    process.env.AWS_SES_FROM_EMAIL || "supplychain@scribbl3d.com";

export interface EmailParams {
    to: string;
    from?: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail(params: EmailParams) {
    const { to, from = DEFAULT_FROM_EMAIL, subject, text, html } = params;

    if (!from) {
        throw new Error("From email address is required");
    }

    try {
        console.log("Attempting to send email via AWS SES:", {
            to,
            from,
            subject,
        });

        const result = await sesEmail({
            to,
            subject,
            html: html || text || "",
            text,
        });

        if (!result.ok) {
            throw new Error(result.error || "Failed to send email");
        }

        console.log(`Email sent successfully to ${to}`);
        return result;
    } catch (error: any) {
        console.error("AWS SES Error:", {
            message: error.message,
        });

        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export async function sendGoogleUserNotification(to: string): Promise<void> {
    const subject = "Account Information - Google Sign-In";
    const text = `You've requested a password reset, but your account uses Google Sign-In. Please use the "Sign in with Google" option on the login page to access your account.`;
    const html = `
    <p>You've requested a password reset, but your account uses Google Sign-In.</p>
    <p>Please use the "Sign in with Google" option on the login page to access your account.</p>
  `;

    try {
        await sendEmail({ to, subject, text, html });
        console.log("Google user notification sent successfully");
    } catch (error) {
        console.error("Error sending Google user notification:", error);
        throw new Error("Failed to send Google user notification");
    }
}

export async function sendPasswordResetEmail(
    to: string,
    token: string,
): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    if (!baseUrl) {
        throw new Error(
            "APP_URL or NEXTAUTH_URL is not set in the environment variables",
        );
    }

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const subject = "Reset Your Password";
    const text = `Click the following link to reset your password: ${resetUrl}`;
    const html = `
    <p>Click the following link to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;

    try {
        await sendEmail({ to, subject, text, html });
        console.log("Password reset email sent successfully");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}