import { sendEmail } from "@/lib/email/sendEmail";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("[Test Email] Starting email test...");
        
        const result = await sendEmail({
            to: "supplychain@scribbl3d.com", // Send to yourself
            subject: "ZeptoMail Test Email",
            html: `
                <h1>Test Email from Scribbl3D</h1>
                <p>If you're receiving this, ZeptoMail is configured correctly!</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            `,
        });

        console.log("[Test Email] Result:", result);

        if (result.ok) {
            return NextResponse.json({
                success: true,
                message: "Email sent successfully!",
                messageId: result.messageId,
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("[Test Email] Error:", error);
        return NextResponse.json({
            success: false,
            error: error?.message || "Unknown error",
            stack: error?.stack,
        }, { status: 500 });
    }
}
