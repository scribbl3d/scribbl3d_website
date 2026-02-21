// // ═══════════════════════════════════════════════════════════════
// // USAGE EXAMPLES — Where to add email sends in your API routes
// // ═══════════════════════════════════════════════════════════════
// //
// // Install: pnpm add @sendgrid/mail
// // Add to .env: SENDGRID_API_KEY=SG.xxxxx
// //
// // These are NOT standalone files — they show the exact lines
// // to add inside your existing route handlers.
// // ═══════════════════════════════════════════════════════════════

// import {
//     sendOrderCancelled,
//     sendOrderConfirmation,
//     sendOrderDelivered,
//     sendOrderShipped,
// } from "@/lib/email";
// import {
//     mapOrderToCancelEmailData,
//     mapOrderToEmailData,
//     mapOrderToShipmentEmailData,
// } from "@/lib/email/mapOrderToEmailData";

// // ─────────────────────────────────────────────────────────────
// // 1. ORDER CONFIRMATION — after payment success callback
// // ─────────────────────────────────────────────────────────────
// // In your PhonePe/payment webhook or wherever you set status = "confirmed"

// async function exampleOrderConfirmation(orderId: string) {
//     const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { user: true },
//     });

//     if (order && order.user?.email) {
//         const emailData = mapOrderToEmailData(order);
//         await sendOrderConfirmation(emailData);
//         // Fire and forget — don't let email failure block the payment flow
//     }
// }

// // ─────────────────────────────────────────────────────────────
// // 2. ORDER SHIPPED — after shipment is manifested (create-shipment route)
// // ─────────────────────────────────────────────────────────────
// // In your app/api/internal/create-shipment/route.ts
// // Add AFTER the prisma.$transaction that creates the shipment

// async function exampleOrderShipped(orderId: string) {
//     const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: {
//             user: true,
//             shipments: { where: { isMaster: true }, take: 1 },
//         },
//     });

//     if (order && order.user?.email && order.shipments[0]) {
//         const shipment = order.shipments[0];
//         const emailData = mapOrderToShipmentEmailData(order, {
//             waybill: shipment.waybill!,
//             trackingUrl:
//                 shipment.trackingUrl ||
//                 `https://www.delhivery.com/track/package/${shipment.waybill}`,
//             provider: "Delhivery",
//         });
//         await sendOrderShipped(emailData);
//     }
// }

// // ─────────────────────────────────────────────────────────────
// // 3. ORDER DELIVERED — in your Delhivery webhook/status sync
// // ─────────────────────────────────────────────────────────────
// // When shipment status updates to "delivered"

// async function exampleOrderDelivered(orderId: string) {
//     const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { user: true },
//     });

//     if (order && order.user?.email) {
//         const emailData = mapOrderToEmailData(order);
//         await sendOrderDelivered(emailData);
//     }
// }

// // ─────────────────────────────────────────────────────────────
// // 4. ORDER CANCELLED — customer-side cancel
// // ─────────────────────────────────────────────────────────────
// // In your cancel order API route

// async function exampleCustomerCancel(orderId: string) {
//     // ... your existing cancel + refund logic ...

//     const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { user: true },
//     });

//     if (order && order.user?.email) {
//         const emailData = mapOrderToCancelEmailData(order, "customer");
//         await sendOrderCancelled(emailData);
//     }
// }

// // ─────────────────────────────────────────────────────────────
// // 5. ORDER CANCELLED — admin-side cancel
// // ─────────────────────────────────────────────────────────────
// // In your admin cancel route

// async function exampleAdminCancel(orderId: string, reason?: string) {
//     // ... your existing admin cancel + refund logic ...

//     const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { user: true },
//     });

//     if (order && order.user?.email) {
//         const emailData = mapOrderToCancelEmailData(order, "admin", reason);
//         await sendOrderCancelled(emailData);
//     }
// }

// // ═══════════════════════════════════════════════════════════════
// // TIP: Use fire-and-forget pattern for emails
// // ═══════════════════════════════════════════════════════════════
// //
// // Don't await email sends in critical paths. Use this pattern:
// //
// //   sendOrderConfirmation(emailData).catch((err) =>
// //       console.error("[Email] Failed to send order confirmation:", err)
// //   );
// //
// // This way, if SendGrid is down, your order flow still works.
// // ═══════════════════════════════════════════════════════════════
