import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PHONEPE_USERNAME = process.env.PHONEPE_USERNAME!;
const PHONEPE_PASSWORD = process.env.PHONEPE_PASSWORD!;

export async function POST(req: NextRequest) {
  try {
    const receivedAuthHeader = req.headers.get("authorization");
    const expectedAuthHeader = crypto
      .createHash("sha256")
      .update(`${PHONEPE_USERNAME}:${PHONEPE_PASSWORD}`)
      .digest("hex");

    if (receivedAuthHeader !== expectedAuthHeader) {
      console.error("Authorization failed for PhonePe callback");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    console.log("Received PhonePe callback:", payload);

    if (payload.type !== "PG_ORDER_COMPLETED" || !payload.payload) {
      console.error("Invalid payload type or missing payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { merchantOrderId, state, paymentDetails } = payload.payload;

    if (
      state !== "COMPLETED" ||
      !paymentDetails ||
      paymentDetails.length === 0
    ) {
      console.error("Payment not completed or missing payment details");
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const paymentInfo = paymentDetails[0];
    if (paymentInfo.state !== "COMPLETED") {
      console.error("Payment details indicate incomplete transaction");
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Here you would update your database with the payment status
    // For example:
    // await updateOrderStatus(merchantOrderId, 'paid', amount / 100);

    console.log(`Payment completed for order ${merchantOrderId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing PhonePe callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
