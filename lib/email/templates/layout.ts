// ─────────────────────────────────────────────
// Base layout wrapper for all Scribbl3D emails
// ─────────────────────────────────────────────

interface LayoutOptions {
    preheader?: string; // Preview text in inbox
    body: string;
}

export function emailLayout({ preheader, body }: LayoutOptions): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scribbl3D</title>
    <!--[if mso]>
    <style>table,td{font-family:Arial,sans-serif;}</style>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    ${preheader ? `<div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}

    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;">
        <tr>
            <td align="center" style="padding:24px 16px;">

                <!-- Main card -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#18181b;padding:24px 32px;text-align:center;">
                            <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Scribbl3D</span>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:32px;">
                            ${body}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 32px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
                            <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-align:center;">
                                Need help? Reply to this email or reach us at
                                <a href="mailto:scribbl3dofficial@gmail.com" style="color:#18181b;text-decoration:underline;">scribbl3dofficial@gmail.com</a>
                            </p>
                            <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                                &copy; ${new Date().getFullYear()} Scribbl3D. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Reusable components for inside templates
// ─────────────────────────────────────────────

export function heading(text: string): string {
    return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;">${text}</h1>`;
}

export function paragraph(text: string): string {
    return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${text}</p>`;
}

export function button(text: string, url: string): string {
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0;">
        <tr>
            <td style="background-color:#18181b;border-radius:8px;">
                <a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                    ${text}
                </a>
            </td>
        </tr>
    </table>`;
}

export function divider(): string {
    return `<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />`;
}

export function infoRow(label: string, value: string): string {
    return `
    <tr>
        <td style="padding:6px 0;font-size:14px;color:#71717a;width:140px;vertical-align:top;">${label}</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;font-weight:500;">${value}</td>
    </tr>`;
}

export function infoTable(rows: string): string {
    return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;">
        ${rows}
    </table>`;
}

export function statusBadge(
    text: string,
    color: "green" | "blue" | "red" | "yellow" | "gray",
): string {
    const colors = {
        green: { bg: "#dcfce7", text: "#166534" },
        blue: { bg: "#dbeafe", text: "#1e40af" },
        red: { bg: "#fee2e2", text: "#991b1b" },
        yellow: { bg: "#fef9c3", text: "#854d0e" },
        gray: { bg: "#f4f4f5", text: "#3f3f46" },
    };
    const c = colors[color];
    return `<span style="display:inline-block;padding:4px 12px;font-size:13px;font-weight:600;color:${c.text};background-color:${c.bg};border-radius:9999px;">${text}</span>`;
}
