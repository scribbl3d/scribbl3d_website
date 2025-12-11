// app/api/check-status/[transactionId]/route.ts
import { createDelhiveryStagingShipment } from "@/lib/delhivery-staging";
import { PrismaClient } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX!;
const ENV = process.env.PHONEPE_ENV === "prod" ? "prod" : "UAT";
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;

sgMail.setApiKey(SENDGRID_API_KEY);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        // Await params (Next.js requirement)
        const { transactionId } = await context.params;

        console.log(
            "[Payment Status Check] Starting status check for transaction:",
            transactionId
        );

        if (!transactionId) {
            console.error(
                "[Payment Status Check] Transaction ID missing from params"
            );
            return NextResponse.json(
                { success: false, message: "Transaction ID is required" },
                { status: 400 }
            );
        }

        // ----------------------
        // DEV MODE: special flow
        // ----------------------
        if (process.env.NODE_ENV !== "production") {
            try {
                console.log(
                    "[DEV MODE] Entered dev branch for txn:",
                    transactionId
                );

                // Find order by transactionId
                const order = await prisma.order.findFirst({
                    where: { transactionId },
                });
                if (!order) {
                    console.warn(
                        "[DEV MODE] Order not found for txn:",
                        transactionId
                    );
                    return NextResponse.json(
                        { success: false, code: "ORDER_NOT_FOUND" },
                        { status: 404 }
                    );
                }

                // Auto-confirm payment (if not already confirmed / shipped)
                if (
                    order.status !== "confirmed" &&
                    order.status !== "shipped"
                ) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "confirmed" },
                    });
                    console.log("[DEV MODE] Order confirmed:", order.id);
                } else {
                    console.log(
                        "[DEV MODE] Order already confirmed/shipped:",
                        order.id,
                        "status:",
                        order.status
                    );
                }

                // Idempotent shipment handling
                const existingShipment = await prisma.shipment.findFirst({
                    where: { orderId: order.id },
                });

                if (existingShipment) {
                    console.log(
                        "[DEV MODE] Found existing shipment for order:",
                        order.id,
                        "shipmentId:",
                        existingShipment.id,
                        "status:",
                        existingShipment.status
                    );

                    const st = String(
                        existingShipment.status || ""
                    ).toLowerCase();

                    // If shipment is created/shipped -> ensure order status = shipped and return success
                    if (["created", "shipped"].includes(st)) {
                        const updated = await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                status: "shipped",
                                trackingInfo: {
                                    provider: existingShipment.provider,
                                    waybill: existingShipment.waybill || null,
                                    trackingUrl:
                                        existingShipment.trackingUrl || null,
                                    raw: existingShipment.rawResponse || {},
                                },
                            },
                        });
                        console.log(
                            "[DEV MODE] Existing shipment indicates created/shipped — forced order.status=shipped for order:",
                            order.id
                        );
                        return NextResponse.json({
                            success: true,
                            code: "PAYMENT_SUCCESS",
                            devMode: true,
                            order: updated,
                        });
                    }

                    // If shipment status is 'error' (staging failing), attempt to re-create via helper
                    if (st === "error") {
                        console.log(
                            "[DEV MODE] Existing shipment in 'error' state. Attempting helper re-create for order:",
                            order.id
                        );
                        const delResult =
                            await createDelhiveryStagingShipment(order);

                        if (delResult.ok && delResult.saved) {
                            const savedStatus = String(
                                delResult.saved.status || ""
                            ).toLowerCase();
                            if (
                                ["created", "shipped"].includes(savedStatus) ||
                                (delResult.saved.waybill &&
                                    delResult.saved.waybill.length > 0)
                            ) {
                                const updated = await prisma.order.update({
                                    where: { id: order.id },
                                    data: {
                                        status: "shipped",
                                        trackingInfo: {
                                            provider:
                                                delResult.saved.provider ||
                                                "DELHIVERY_STAGING",
                                            waybill:
                                                delResult.saved.waybill || null,
                                            trackingUrl:
                                                delResult.saved.trackingUrl ||
                                                null,
                                            raw:
                                                delResult.saved.rawResponse ||
                                                delResult.delhiveryResp ||
                                                {},
                                        },
                                    },
                                });
                                console.log(
                                    "[DEV MODE] Re-create succeeded — order marked shipped:",
                                    order.id
                                );
                                return NextResponse.json({
                                    success: true,
                                    code: "PAYMENT_SUCCESS",
                                    devMode: true,
                                    order: updated,
                                });
                            } else {
                                // helper ran but no waybill - update trackingInfo and return pending
                                const updated = await prisma.order.update({
                                    where: { id: order.id },
                                    data: {
                                        trackingInfo: {
                                            provider:
                                                delResult.saved.provider ||
                                                "DELHIVERY_STAGING",
                                            waybill:
                                                delResult.saved.waybill || null,
                                            trackingUrl:
                                                delResult.saved.trackingUrl ||
                                                null,
                                            raw:
                                                delResult.saved.rawResponse ||
                                                delResult.delhiveryResp ||
                                                {},
                                        },
                                    },
                                });
                                console.log(
                                    "[DEV MODE] Re-create ran but no waybill yet. Order trackingInfo updated:",
                                    order.id
                                );
                                return NextResponse.json({
                                    success: true,
                                    code: "PAYMENT_PENDING",
                                    devMode: true,
                                    order: updated,
                                });
                            }
                        } else {
                            console.warn(
                                "[DEV MODE] Re-create failed:",
                                delResult.error ?? delResult.delhiveryResp
                            );
                            // update trackingInfo with the error blob but don't mark shipped
                            await prisma.order.update({
                                where: { id: order.id },
                                data: {
                                    trackingInfo: {
                                        provider: "DELHIVERY_STAGING",
                                        raw:
                                            delResult.delhiveryResp ??
                                            delResult.error ??
                                            {},
                                    },
                                },
                            });
                            return NextResponse.json(
                                {
                                    success: false,
                                    code: "DELHIVERY_ERROR",
                                    devMode: true,
                                    details: delResult,
                                },
                                { status: 500 }
                            );
                        }
                    }

                    // Existing shipment present but not in error/created/shipped (some other state) -> attempt helper
                    console.log(
                        "[DEV MODE] Existing shipment present but not created/shipped/error -> trying helper for refresh:",
                        existingShipment.id
                    );
                    const delResult =
                        await createDelhiveryStagingShipment(order);
                    if (delResult.ok && delResult.saved) {
                        const savedStatus = String(
                            delResult.saved.status || ""
                        ).toLowerCase();
                        if (
                            ["created", "shipped"].includes(savedStatus) ||
                            (delResult.saved.waybill &&
                                delResult.saved.waybill.length > 0)
                        ) {
                            const updated = await prisma.order.update({
                                where: { id: order.id },
                                data: {
                                    status: "shipped",
                                    trackingInfo: {
                                        provider:
                                            delResult.saved.provider ||
                                            "DELHIVERY_STAGING",
                                        waybill:
                                            delResult.saved.waybill || null,
                                        trackingUrl:
                                            delResult.saved.trackingUrl || null,
                                        raw:
                                            delResult.saved.rawResponse ||
                                            delResult.delhiveryResp ||
                                            {},
                                    },
                                },
                            });
                            console.log(
                                "[DEV MODE] Helper created/updated shipment — order marked shipped:",
                                order.id
                            );
                            return NextResponse.json({
                                success: true,
                                code: "PAYMENT_SUCCESS",
                                devMode: true,
                                order: updated,
                            });
                        } else {
                            const updated = await prisma.order.update({
                                where: { id: order.id },
                                data: {
                                    trackingInfo: {
                                        provider:
                                            delResult.saved.provider ||
                                            "DELHIVERY_STAGING",
                                        waybill:
                                            delResult.saved.waybill || null,
                                        trackingUrl:
                                            delResult.saved.trackingUrl || null,
                                        raw:
                                            delResult.saved.rawResponse ||
                                            delResult.delhiveryResp ||
                                            {},
                                    },
                                },
                            });
                            console.log(
                                "[DEV MODE] Helper ran but no waybill — order trackingInfo updated:",
                                order.id
                            );
                            return NextResponse.json({
                                success: true,
                                code: "PAYMENT_PENDING",
                                devMode: true,
                                order: updated,
                            });
                        }
                    } else {
                        console.warn(
                            "[DEV MODE] Helper failed to refresh shipment:",
                            delResult.error ?? delResult.delhiveryResp
                        );
                        await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                trackingInfo: {
                                    provider: "DELHIVERY_STAGING",
                                    raw:
                                        delResult.delhiveryResp ??
                                        delResult.error ??
                                        {},
                                },
                            },
                        });
                        return NextResponse.json(
                            {
                                success: false,
                                code: "DELHIVERY_ERROR",
                                devMode: true,
                                details: delResult,
                            },
                            { status: 500 }
                        );
                    }
                }

                // No existing shipment -> call helper to create one
                console.log(
                    "[DEV MODE] No existing shipment — creating via helper for order:",
                    order.id
                );
                const createResult =
                    await createDelhiveryStagingShipment(order);

                if (createResult.ok && createResult.saved) {
                    const savedStatus = String(
                        createResult.saved.status || ""
                    ).toLowerCase();
                    if (
                        ["created", "shipped"].includes(savedStatus) ||
                        (createResult.saved.waybill &&
                            createResult.saved.waybill.length > 0)
                    ) {
                        const updated = await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                status: "shipped",
                                trackingInfo: {
                                    provider:
                                        createResult.saved.provider ||
                                        "DELHIVERY_STAGING",
                                    waybill: createResult.saved.waybill || null,
                                    trackingUrl:
                                        createResult.saved.trackingUrl || null,
                                    raw:
                                        createResult.saved.rawResponse ||
                                        createResult.delhiveryResp ||
                                        {},
                                },
                            },
                        });
                        console.log(
                            "[DEV MODE] Shipment created and order marked shipped:",
                            order.id
                        );
                        return NextResponse.json({
                            success: true,
                            code: "PAYMENT_SUCCESS",
                            devMode: true,
                            order: updated,
                        });
                    } else {
                        const updated = await prisma.order.update({
                            where: { id: order.id },
                            data: {
                                trackingInfo: {
                                    provider:
                                        createResult.saved.provider ||
                                        "DELHIVERY_STAGING",
                                    waybill: createResult.saved.waybill || null,
                                    trackingUrl:
                                        createResult.saved.trackingUrl || null,
                                    raw:
                                        createResult.saved.rawResponse ||
                                        createResult.delhiveryResp ||
                                        {},
                                },
                            },
                        });
                        console.log(
                            "[DEV MODE] Helper ran but no waybill — order updated trackingInfo:",
                            order.id
                        );
                        return NextResponse.json({
                            success: true,
                            code: "PAYMENT_PENDING",
                            devMode: true,
                            order: updated,
                        });
                    }
                } else {
                    console.warn(
                        "[DEV MODE] createDelhiveryStagingShipment failed:",
                        createResult.error ?? createResult.delhiveryResp
                    );
                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            trackingInfo: {
                                provider: "DELHIVERY_STAGING",
                                raw:
                                    createResult.delhiveryResp ??
                                    createResult.error ??
                                    {},
                            },
                        },
                    });
                    return NextResponse.json(
                        {
                            success: false,
                            code: "DELHIVERY_ERROR",
                            devMode: true,
                            details: createResult,
                        },
                        { status: 500 }
                    );
                }
            } catch (err: any) {
                console.error("[DEV MODE] check-status branch error:", err);
                return NextResponse.json(
                    { success: false, code: "ERROR", message: String(err) },
                    { status: 500 }
                );
            }
        } // end DEV branch

        // ----------------------
        // PRODUCTION / NORMAL: check PhonePe status
        // ----------------------
        const checkStatus = async () => {
            console.log("[PhonePe API] Preparing to call PhonePe status API");

            const merchantId = MERCHANT_ID;
            const url = `https://api${ENV === "prod" ? "" : "-preprod"}.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`;

            const string = `/pg/v1/status/${merchantId}/${transactionId}${SALT_KEY}`;
            const sha256 = crypto
                .createHash("sha256")
                .update(string)
                .digest("hex");
            const xVerify = `${sha256}###${SALT_INDEX}`;

            console.log("[PhonePe API] Request details:", {
                url,
                merchantId,
                transactionId,
                xVerifyPrefix: xVerify.substring(0, 20) + "...",
            });

            try {
                const response = await axios.get(url, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-VERIFY": xVerify,
                        "X-MERCHANT-ID": merchantId,
                    },
                });

                console.log("[PhonePe API] Response received:", {
                    status: response.status,
                    data: response.data,
                });
                return response.data;
            } catch (error: any) {
                console.error("[PhonePe API] Error in API call:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers,
                });
                throw error;
            }
        };

        const result = await checkStatus();

        if (result.success && result.code === "PAYMENT_SUCCESS") {
            console.log(
                "[Payment Status Check] Payment successful, updating order status"
            );

            try {
                const order = await prisma.order.findFirst({
                    where: { transactionId },
                    include: { user: true },
                });

                if (!order) {
                    console.error(
                        "[Database] No order found with transactionId:",
                        transactionId
                    );
                    return NextResponse.json(
                        { success: false, code: "ORDER_NOT_FOUND" },
                        { status: 404 }
                    );
                }

                if (
                    order.status !== "confirmed" &&
                    order.status !== "shipped"
                ) {
                    const updatedOrder = await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "confirmed" },
                        include: { user: true },
                    });
                    console.log(
                        "[Database] Order status updated to confirmed:",
                        updatedOrder.id
                    );

                    try {
                        await sendOrderConfirmationEmail(updatedOrder);
                        console.log(
                            "[Email] Confirmation email sent successfully for order:",
                            order.id
                        );
                    } catch (emailError: any) {
                        console.error(
                            "[Email] Failed to send confirmation email:",
                            { error: emailError.message, orderId: order.id }
                        );
                    }
                } else {
                    console.log(
                        "[Database] Order already confirmed/shipped, skipping update:",
                        order.id,
                        "status:",
                        order.status
                    );
                }
            } catch (dbError) {
                console.error(
                    "[Database] Error updating order status:",
                    dbError
                );
                throw dbError;
            }

            return NextResponse.json({
                success: true,
                code: "PAYMENT_SUCCESS",
                data: result,
            });
        }

        if (result.code === "PAYMENT_PENDING") {
            console.log("[Payment Status Check] Payment is still pending");
            return NextResponse.json({
                success: false,
                code: "PAYMENT_PENDING",
                message: "Payment is still being processed",
            });
        }

        console.log(
            "[Payment Status Check] Payment failed or unknown status:",
            result.code
        );
        return NextResponse.json({
            success: false,
            code: result.code || "PAYMENT_FAILED",
            message: result.message || "Payment failed or status unknown",
        });
    } catch (error) {
        console.error("[Payment Status Check] Unhandled error:", error);
        return NextResponse.json(
            {
                success: false,
                code: "ERROR",
                message: "Failed to check payment status",
            },
            { status: 500 }
        );
    }
}

/* ---------------------------
   sendOrderConfirmationEmail
   (Keep your existing function as-is)
   --------------------------- */
async function sendOrderConfirmationEmail(order: any) {
    const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

    let items;
    try {
        items =
            typeof order.items === "string" && order.items.trim() !== ""
                ? JSON.parse(order.items)
                : order.items;
    } catch (error) {
        console.error("[Email] Error parsing order items:", error);
        items = [];
    }

    if (!Array.isArray(items)) {
        console.warn("[Email] Order items is not an array:", items);
        items = [];
    }

    const userEmail = order.user?.email || "customer@example.com";

    if (!userEmail || userEmail === "customer@example.com") {
        throw new Error(`Invalid email address for order ${order.id}`);
    }

    const msg = {
        to: userEmail,
        from: SENDGRID_FROM_EMAIL,
        subject: "Your Order is Confirmed! - Scribbl3D",
        html: `...`, // keep your full HTML from the original function here
    };

    try {
        console.log(
            "[Email] Attempting to send confirmation email to:",
            userEmail
        );
        const response = await sgMail.send(msg);
        console.log("[Email] SendGrid API Response:", {
            statusCode: response[0]?.statusCode,
            headers: response[0]?.headers,
            orderId: order.id,
        });
        return true;
    } catch (error: any) {
        console.error("[Email] Failed to send confirmation email:", {
            error: error.message,
            code: error.code,
            response: error.response?.body,
            orderId: order.id,
            userEmail,
        });
        throw error;
    }
}
