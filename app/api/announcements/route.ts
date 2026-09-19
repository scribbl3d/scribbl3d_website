import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { announcementOrder, announcementSchema, announcementSelect } from "@/lib/announcements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("admin") === "true";
  if (admin && !(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  try {
    const announcements = await prisma.announcement.findMany({
      where: admin ? {} : { isActive: true },
      orderBy: [...announcementOrder],
      select: announcementSelect,
    });
    return NextResponse.json(announcements, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load announcements. Check that the announcement migration has been applied." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  const parsed = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const announcement = await prisma.announcement.create({ data: parsed.data, select: announcementSelect });
    return NextResponse.json(announcement, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create announcement" }, { status: 500 });
  }
}
