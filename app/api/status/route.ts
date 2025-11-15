import crypto from "crypto";
import axios from "axios";
import { NextResponse } from "next/server";

const saltKey = process.env.PHONEPE_SALT_KEY;
const merchantId = process.env.PHONEPE_MERCHANT_ID;

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const merchantTransactionId = url.searchParams.get("id");

    if (!merchantTransactionId) {
      throw new Error("Transaction ID is missing");
    }

    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const options = {
      method: "GET",
      url: `https://api.phonepe.com/apis/hermes/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios(options);

    if (response.data.success === true) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        {
          status: 301,
        }
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/failed`,
        {
          status: 301,
        }
      );
    }
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Payment check failed", details: errorMessage },
      { status: 500 }
    );
  }
}
