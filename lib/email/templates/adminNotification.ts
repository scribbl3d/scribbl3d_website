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
    | "stock-notification";

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

export function adminNotificationTemplate(data: AdminNotificationData): string {
    const config = TYPE_CONFIG[data.type];
    const now = new Date();
    const timestamp = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

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

        ${button("View in Admin Dashboard", `${process.env.NEXT_PUBLIC_BASE_URL || "https://scribbl3d.com"}/ops/control`)}

        ${paragraph('<span style="font-size:13px;color:#a1a1aa;">This is an automated notification from the Scribbl3D admin system.</span>')}
    `;

    return emailLayout({ preheader: `${config.title} — Scribbl3D Admin`, body });
}
