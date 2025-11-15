import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return `${src}?w=${width}&q=${quality || 75}`;
}

export function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePhonePeChecksum(
  payload: string,
  saltKey: string,
  saltIndex: string
): string {
  const string = `${payload}${saltKey}`;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  return `${sha256}###${saltIndex}`;
}

export function verifyPhonePeChecksum(
  payload: string,
  saltKey: string,
  saltIndex: string,
  receivedChecksum: string
): boolean {
  const calculatedChecksum = generatePhonePeChecksum(
    payload,
    saltKey,
    saltIndex
  );
  return calculatedChecksum === receivedChecksum;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries}`);
      const response = await fetch(url, options);

      console.log(`Response status: ${response.status}`);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter
          ? Number.parseInt(retryAfter) * 1000
          : Math.min(30000 * (attempt + 1), 300000); // Start with 30s, max 5 minutes

        console.log(`Rate limited. Retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        const delay = Math.min(30000 * (attempt + 1), 300000);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Max retries reached (${maxRetries}). Last error: ${lastError?.message}`
  );
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export const PHONEPE_ERROR_CODES = {
  PAYMENT_ERROR: "Payment initiation has failed",
  INTERNAL_SERVER_ERROR: "Something went wrong",
  BAD_REQUEST: "Invalid request",
  AUTHORIZATION_FAILED: "X-VERIFY header is incorrect",
  INTERNAL_SECURITY_BLOCK_1: "Mismatch in Transaction URL",
  INTERNAL_SECURITY_BLOCK_2: "Mismatch in Transaction IP Address",
  INTERNAL_SECURITY_BLOCK_4: "Mismatch in Transaction Package Name",
  INTERNAL_SECURITY_BLOCK_5: "Missing or outdated Business Policy/s",
  INTERNAL_SECURITY_BLOCK_6: "TPV Limit Reached",
};

export function getPhonePeErrorMessage(code: string): string {
  return (
    PHONEPE_ERROR_CODES[code as keyof typeof PHONEPE_ERROR_CODES] ||
    "An unknown error occurred"
  );
}
