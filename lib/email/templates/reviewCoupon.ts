import { emailLayout, heading, paragraph } from "./layout";

export interface ReviewCouponEmailData {
    customerName: string | null | undefined;
    couponCode: string;
    reviewDate: Date;
    expiryDate: Date;
}

const formatDate = (date: Date) =>
    date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** Thank-you + coupon email sent when a review earns a coupon (wording supplied by the user) */
export function reviewCouponTemplate(data: ReviewCouponEmailData): string {
    const firstName = data.customerName?.trim().split(/\s+/)[0] || "there";
    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.scribbl3d.com";

    const body = `
        ${paragraph(`Hi ${firstName},`)}
        ${paragraph("Thank you for taking the time to share your experience with SCRIBBL3D.")}
        ${paragraph("Your feedback helps us improve our products and helps other makers make better decisions.")}

        ${heading("Here’s a thank-you from us")}
        ${paragraph("We’ve added your SCRIBBL3D coupon below.")}

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;background-color:#f5f7ff;border:1px dashed #a5b4fc;border-radius:12px;">
            <tr>
                <td align="center" style="padding:24px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#4f46e5;font-weight:600;">Coupon</p>
                    <p style="margin:0 0 12px;font-size:26px;letter-spacing:0.12em;font-weight:800;color:#18181b;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">${data.couponCode}</p>
                    <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;"><strong>Discount:</strong> 5% upto 500 rupees</p>
                    <p style="margin:0;font-size:15px;color:#3f3f46;"><strong>Valid for 15 days</strong></p>
                </td>
            </tr>
        </table>

        ${paragraph("Your coupon is valid for 15 days from the date of your review.")}
        <p style="margin:0 0 4px;font-size:15px;line-height:1.6;color:#3f3f46;">Review date: <strong>${formatDate(data.reviewDate)}</strong></p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">Expires on: <strong>${formatDate(data.expiryDate)}</strong></p>
        ${paragraph("Please make sure to use it before the expiry date.")}

        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
            <tr>
                <td style="background-color:#4f46e5;border-radius:8px;">
                    <a href="${shopUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Shop SCRIBBL3D</a>
                </td>
            </tr>
        </table>

        ${paragraph("We hope to see you again soon.")}
        <p style="margin:24px 0 0;font-size:14px;color:#3f3f46;">
            Regards,<br/>
            <strong>Team SCRIBBL3D</strong>
        </p>
    `;

    return emailLayout({
        preheader: `Your SCRIBBL3D coupon ${data.couponCode} is valid until ${formatDate(data.expiryDate)}.`,
        body,
    });
}
