import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pollPaymentStatus } from "@/utils/payment-status";

const salt_key = process.env.PHONEPE_SALT_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Verify the callback signature if present
    const phonepeSignature = req.headers.get("X-VERIFY");
    const body = await req.text();

    if (phonepeSignature && body) {
      const keyIndex = 1;
      const string = body + salt_key;
      const sha256 = crypto.createHash("sha256").update(string).digest("hex");
      const checksum = sha256 + "###" + keyIndex;

      if (checksum !== phonepeSignature) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?reason=INVALID_SIGNATURE`,
          {
            status: 301,
          }
        );
      }

      // Parse and process the callback payload
      try {
        console.log("Raw body:", body);
        const decodedResponse = JSON.parse(
          Buffer.from(body, "base64").toString()
        );
        console.log("Decoded response:", decodedResponse);
        return handlePaymentResponse(decodedResponse);
      } catch (parseError) {
        console.error("Error parsing callback payload:", parseError);
        console.error("Raw body that failed to parse:", body);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?reason=INVALID_PAYLOAD`,
          {
            status: 301,
          }
        );
      }
    }

    // If no callback signature, poll for status
    const status = await pollPaymentStatus(id);
    return handlePaymentResponse(status.data);
  } catch (error) {
    console.error("Payment status processing error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?reason=PROCESSING_ERROR`,
      {
        status: 301,
      }
    );
  }
}

function handlePaymentResponse(response: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const code = response.code;
  const transactionId = response.data?.transactionId || "UNKNOWN";
  const amount = response.data?.amount || 0;

  switch (code) {
    case "PAYMENT_SUCCESS":
      return NextResponse.redirect(
        `${baseUrl}/payment/success?txnId=${transactionId}&amount=${amount}`,
        {
          status: 301,
        }
      );

    case "PAYMENT_PENDING":
      return NextResponse.redirect(
        `${baseUrl}/payment/pending?txnId=${transactionId}`,
        { status: 301 }
      );

    case "PAYMENT_ERROR":
    case "PAYMENT_DECLINED":
    case "TIMED_OUT":
      return NextResponse.redirect(
        `${baseUrl}/payment/failed?reason=${code}&txnId=${transactionId}`,
        { status: 301 }
      );

    default:
      return NextResponse.redirect(
        `${baseUrl}/payment/failed?reason=UNKNOWN_ERROR`,
        { status: 301 }
      );
  }
}
