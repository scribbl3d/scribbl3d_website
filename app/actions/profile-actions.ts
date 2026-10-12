"use server";

// updateEmail was removed: it changed the account email without verifying
// the new address (account takeover risk) and had no callers. A future email
// change must confirm the new address with an OTP before saving it.
export async function updateEmail(): Promise<{ success: boolean }> {
  throw new Error("Email changes are not available");
}
