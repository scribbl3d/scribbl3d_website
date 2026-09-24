// ─────────────────────────────────────────────
// Admin Notification Email Template
// Sent to logistics.scribbl3d@gmail.com when new
// items appear in admin dashboard tables
// ─────────────────────────────────────────────

import { emailLayout, heading, paragraph, divider, infoRow, infoTable, statusBadge, button } from "./layout";

export type AdminNotificationType =
    | "order-confirmed"
    | "personalise-response"
    | "form3d-response"
    | "prototyping-request"
    | "small-batch-manufacturing"
    | "stock-notification"
    | "contact-form";

interface AdminNotificationData {
    type: AdminNotificationType;
    details: Record<string, string | number | null | undefined>;
    /** Optional list of sub-items (e.g. order items, batch products) */
    subItems?: Array<Record<string, string | number | null | undefined>>;
}

const TYPE_CONFIG: Record<AdminNotificationType, { title: string; badge: string; badgeColor: "green" | "blue" | "red" | "yellow" | "gray" }> = {
    "order-confirmed": { title: "New Order Confirmed", badge: "ORDER", badgeColor: "green" },
    "personalise-response": { title: "New Personalise Form Response", badge: "PERSONALISE", badgeColor: "blue" },
    "form3d-response": { title: "New 3D Printing Request", badge: "3D PRINTING", badgeColor: "blue" },
    "prototyping-request": { title: "New Prototyping Request", badge: "PROTOTYPING", badgeColor: "yellow" },
    "small-batch-manufacturing": { title: "New Small Batch Manufacturing Request", badge: "SMALL BATCH", badgeColor: "yellow" },
    "stock-notification": { title: "New Out-of-Stock Notification", badge: "STOCK ALERT", badgeColor: "red" },
    "contact-form": { title: "New Contact Form Submission", badge: "CONTACT", badgeColor: "blue" },
};

function formatValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "number") return String(value);
    return value;
}

function buildDetailsRows(details: Record<string, string | number | null | undefined>): string {
    return Object.entries(details)
        .map(([label, value]) => infoRow(label, formatValue(value)))
        .join("");
}

function buildSubItemsHtml(subItems: Array<Record<string, string | number | null | undefined>>): string {
    if (!subItems.length) return "";

    return subItems.map((item, index) => {
        const rows = Object.entries(item)
            .map(([label, value]) => infoRow(label, formatValue(value)))
            .join("");
        return `
            <div style="margin:12px 0;padding:12px 16px;background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;">Item ${index + 1}</p>
                ${infoTable(rows)}
            </div>`;
    }).join("");
}

function buildContactFormBody(details: Record<string, string | number | null | undefined>, timestamp: string): string {
    const name = formatValue(details.Name);
    const email = formatValue(details.Email);
    const phone = formatValue(details.Phone);
    const subject = formatValue(details.Subject);
    const message = formatValue(details.Message);

    const contactRows = [
        infoRow("Name", name),
        infoRow("Email", `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>`),
        ...(phone !== "—" ? [infoRow("Phone", `<a href="tel:${phone.replace(/\s/g, "")}" style="color:#2563eb;text-decoration:none;">${phone}</a>`)] : []),
        infoRow("Subject", `<strong>${subject}</strong>`),
    ].join("");

    return `
        ${heading("New Contact Form Message")}
        <div style="margin-bottom:20px;">
            ${statusBadge("CONTACT", "blue")}
            <span style="margin-left:12px;font-size:13px;color:#71717a;">${timestamp} IST</span>
        </div>

        ${paragraph(`<strong>${name}</strong> submitted a message via the Contact Us page.`)}

        ${divider()}

        <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Contact Details</h2>
        ${infoTable(contactRows)}

        ${divider()}

        <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Message</h2>
        <div style="margin:12px 0 24px;padding:16px 20px;background-color:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap;">
            ${message}
        </div>

        ${button("Reply via Email", `mailto:${email}?subject=Re: ${encodeURIComponent(String(subject))}`)}

        ${paragraph('<span style="font-size:13px;color:#a1a1aa;">This message was submitted on the Scribbl3D Contact Us page.</span>')}
    `;
}

export function adminNotificationTemplate(data: AdminNotificationData): string {
    const config = TYPE_CONFIG[data.type];
    const now = new Date();
    const timestamp = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

    // Custom template for contact form
    if (data.type === "contact-form") {
        return emailLayout({
            preheader: `New contact message from ${formatValue(data.details.Name)} — ${formatValue(data.details.Subject)}`,
            body: buildContactFormBody(data.details, timestamp),
        });
    }

    const body = `
        ${heading(config.title)}
        <div style="margin-bottom:16px;">
            ${statusBadge(config.badge, config.badgeColor)}
            <span style="margin-left:12px;font-size:13px;color:#71717a;">${timestamp} IST</span>
        </div>

        ${paragraph("A new entry has been added to the admin dashboard. Here are the full details:")}

        ${divider()}

        <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Details</h2>
        ${infoTable(buildDetailsRows(data.details))}

        ${data.subItems && data.subItems.length > 0 ? `
            ${divider()}
            <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Items (${data.subItems.length})</h2>
            ${buildSubItemsHtml(data.subItems)}
        ` : ""}

        ${divider()}

        ${button("View in Admin Dashboard", `${(process.env.NEXT_PUBLIC_BASE_URL || "https://scribbl3d.com").replace(/\/+$/, "")}/ops/control`)}

        ${paragraph('<span style="font-size:13px;color:#a1a1aa;">This is an automated notification from the Scribbl3D admin system.</span>')}
    `;

    return emailLayout({ preheader: `${config.title} — Scribbl3D Admin`, body });
}
