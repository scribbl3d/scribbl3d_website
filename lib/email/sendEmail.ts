
// Switch to ZeptoMail
export { sendEmail } from "./sendEmail-zeptomail";

// Previous providers (AWS SES, SendGrid)
// export { sendEmail } from "./sendEmail-ses";
// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// // ─────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────

// interface EmailOptions {
//     to: string;
//     subject: string;
//     html: string;
//     text?: string; // plain-text fallback (auto-stripped if not provided)
// }

// // ─────────────────────────────────────────────
// // Core send function
// // ─────────────────────────────────────────────

// export async function sendEmail({ to, subject, html, text }: EmailOptions) {
//     try {
//         await sgMail.send({
//             to,
//             from: {
//                 email: "supplychain@scribbl3d.com",
//                 name: "Scribbl3D",
//             },
//             subject,
//             html,
//             text: text || stripHtml(html),
//         });
//         console.log(`[Email] Sent "${subject}" to ${to}`);
//         return { ok: true };
//     } catch (error: any) {
//         console.error(
//             `[Email] Failed to send "${subject}" to ${to}:`,
//             error?.response?.body || error,
//         );
//         return { ok: false, error: error?.message || "Email send failed" };
//     }
// }

// // ─────────────────────────────────────────────
// // Helper: strip HTML tags for plain-text fallback
// // ─────────────────────────────────────────────

// function stripHtml(html: string): string {
//     return html
//         .replace(/<br\s*\/?>/gi, "\n")
//         .replace(/<\/p>/gi, "\n\n")
//         .replace(/<[^>]+>/g, "")
//         .replace(/&nbsp;/g, " ")
//         .replace(/&amp;/g, "&")
//         .replace(/&lt;/g, "<")
//         .replace(/&gt;/g, ">")
//         .replace(/\n{3,}/g, "\n\n")
//         .trim();
// }
