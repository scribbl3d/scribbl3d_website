import { z } from "zod";

export const announcementIcons = ["truck", "tag", "sparkles", "info", "none"] as const;

export function isSafeAnnouncementLink(value: string) {
  try {
    const decoded = decodeURIComponent(value);
    if (/[\s\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return false;
    const url = new URL(decoded, "https://www.scribbl3d.com");
    return (decoded.startsWith("/") || decoded.startsWith("https://")) &&
      url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

const optionalText = (max: number) => z.string().trim().max(max).nullish().transform((value) => value || null);

export const announcementSchema = z.object({
  text: z.string().trim().max(160, "Keep the message within 160 characters").default(""),
  icon: z.enum(announcementIcons).default("truck"),
  linkLabel: optionalText(32),
  linkUrl: optionalText(2048).refine((value) => !value || isSafeAnnouncementLink(value), "Use a site path starting with / or a valid HTTPS URL"),
  isActive: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
}).strict().refine((data) => !!data.linkLabel === !!data.linkUrl, {
  message: "Provide both link text and a destination, or leave both empty",
  path: ["linkUrl"],
}).refine((data) => !!data.text || !!(data.linkLabel && data.linkUrl), {
  message: "Enter announcement text or add a link",
  path: ["text"],
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type Announcement = AnnouncementInput & { id: string };

export const announcementSelect = {
  id: true, text: true, icon: true, linkLabel: true, linkUrl: true, isActive: true, sortOrder: true,
} as const;

export const announcementOrder = [{ createdAt: "desc" }, { id: "asc" }] as const;

export function showStorefrontAnnouncement(pathname: string) {
  return !["/ops", "/admin", "/checkout", "/payment"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
