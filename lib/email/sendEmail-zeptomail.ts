import { SendMailClient } from "zeptomail";

// ─────────────────────────────────────────────
// ZeptoMail Client Configuration
// ─────────────────────────────────────────────

const url = "https://api.zeptomail.in/v1.1/email";
const token = process.env.ZEPTOMAIL_API_TOKEN || process.env.ZEPTOMAIL_API_KEY;

if (!token) {
  console.error("❌ ZeptoMail configuration error: ZEPTOMAIL_API_TOKEN or ZEPTOMAIL_API_KEY not found in environment variables");
}

const client = token ? new SendMailClient({ url, token }) : null;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ZeptoMailResponse {
  request_id?: string;
  message?: string;
  [key: string]: any;
}

// ─────────────────────────────────────────────
// Core send function
// ─────────────────────────────────────────────

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    if (!client) {
      console.error("❌ Email service not configured: ZeptoMail client is not initialized");
      return { 
        ok: false, 
        error: "Email service configuration error. Please contact support." 
      };
    }

    const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
    if (!fromEmail) {
      console.error("❌ ZEPTOMAIL_FROM_EMAIL not configured in environment variables");
      return { 
        ok: false, 
        error: "Email sender address not configured" 
      };
    }

    const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Scribbl3D";

    const response = await client.sendMail({
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: to,
            name: "",
          },
        },
      ],
      subject: subject,
      htmlbody: html,
      textbody: text || stripHtml(html),
    }) as ZeptoMailResponse;

    console.log(`✅ [Email] Sent "${subject}" to ${to} (Response: ${JSON.stringify(response)})`);
    return { ok: true, messageId: response.request_id || "sent" };
  } catch (error: any) {
    console.error(
      `❌ [Email] Failed to send "${subject}" to ${to}:`,
      error?.message || error,
      "\nFull error:", error
    );
    return { ok: false, error: error?.message || "Email send failed" };
  }
}

// ─────────────────────────────────────────────
// Helper: Strip HTML tags for plain-text fallback
// ─────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
