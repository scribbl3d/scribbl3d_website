import { sendEmail as sesEmail } from "@/lib/email/sendEmail";

export { sendAdminNotification } from "@/lib/email/index";
export type { AdminNotificationType } from "@/lib/email/index";

// Default sender email
const DEFAULT_FROM_EMAIL =
    process.env.ZEPTOMAIL_FROM_EMAIL || "supplychain@scribbl3d.com";

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
        console.log("Attempting to send email via ZeptoMail:", {
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
        console.error("ZeptoMail Error:", {
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

    const subject = "Reset Your Password - Scribbl3D";
    const text = `You requested to reset your password. Click the following link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 32px;
          margin: 20px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
        }
        .warning {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 12px;
          margin: 24px 0;
          font-size: 14px;
          color: #991b1b;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 32px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1 style="color: #111827; margin: 0;">Reset Your Password</h1>
          </div>
          
          <p style="color: #374151;">You requested to reset your password for your Scribbl3D account.</p>
          
          <p style="color: #374151;">Click the button below to set a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a></p>
          
          <div class="warning">
            <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Scribbl3D. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        await sendEmail({ to, subject, text, html });
        console.log("Password reset email sent successfully");
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send password reset email");
    }
}