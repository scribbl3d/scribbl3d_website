import axios from "axios";
import crypto from "crypto";

const RETRY_INTERVALS = [
  25000, // First check after 25 seconds
  ...[...Array(10)].map(() => 3000), // Every 3 seconds for next 30 seconds
  ...[...Array(10)].map(() => 6000), // Every 6 seconds for next 60 seconds
  ...[...Array(6)].map(() => 10000), // Every 10 seconds for next 60 seconds
  ...[...Array(2)].map(() => 30000), // Every 30 seconds for next 60 seconds
  ...[...Array(20)].map(() => 60000), // Every 1 minute until timeout (20 mins)
];

export async function checkPaymentStatus(merchantTransactionId: string) {
  const salt_key = process.env.PHONEPE_SALT_KEY;
  const merchant_id = process.env.PHONEPE_MERCHANT_ID;

  if (!salt_key || !merchant_id) {
    throw new Error("Missing PhonePe credentials");
  }

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchant_id}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  try {
    const response = await axios.get(
      `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchant_id}/${merchantTransactionId}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": merchant_id,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Status check failed:", error);
    throw error;
  }
}

export async function pollPaymentStatus(merchantTransactionId: string) {
  let currentTry = 0;

  while (currentTry < RETRY_INTERVALS.length) {
    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_INTERVALS[currentTry])
    );

    try {
      const status = await checkPaymentStatus(merchantTransactionId);

      if (status.code === "PAYMENT_SUCCESS") {
        return { success: true, data: status };
      }

      if (
        status.code === "PAYMENT_ERROR" ||
        status.code === "PAYMENT_DECLINED" ||
        status.code === "TIMED_OUT"
      ) {
        return { success: false, data: status };
      }

      // For PAYMENT_PENDING, continue polling
      currentTry++;
    } catch (error) {
      console.error(`Attempt ${currentTry + 1} failed:`, error);
      currentTry++;
    }
  }

  return { success: false, data: { code: "TIMED_OUT" } };
}
