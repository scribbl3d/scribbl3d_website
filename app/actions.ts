"use server";

import { authorizeUser, withAuth } from "@/lib/auth";
import { sanitizeUser } from "@/lib/dtos";
import { revalidatePath } from "next/cache";

type ProfileData = {
  name?: string;
  email?: string;
};

export const updateProfile = withAuth(async (data: ProfileData) => {
  const session = await authorizeUser();
  const user = sanitizeUser(session);

  // Perform update logic here
  console.log("Updating profile for user:", user.id, "with data:", data);

  revalidatePath("/profile");
  return { success: true };
});

export const adminAction = withAuth(async (userId: string) => {
  // Perform admin-only action here
  console.log("Performing admin action for user:", userId);
  return { success: true };
}, "admin");
