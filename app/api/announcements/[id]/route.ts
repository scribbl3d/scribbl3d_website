import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-session";
import { announcementSchema, announcementSelect } from "@/lib/announcements";

type Context = { params: Promise<{ id: string }> };

function mutationError(error: unknown) {
  const missing = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
  return NextResponse.json({ error: missing ? "Announcement not found" : "Unable to save announcement changes" }, { status: missing ? 404 : 500 });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  const { id } = await params;
  if (!z.string().cuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid announcement ID" }, { status: 400 });
  }
  const parsed = announcementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const announcement = await prisma.announcement.update({ where: { id }, data: parsed.data, select: announcementSelect });
    return NextResponse.json(announcement);
  } catch (error) {
    return mutationError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Admin sign-in required" }, { status: 401 });
  }
  const { id } = await params;
  if (!z.string().cuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid announcement ID" }, { status: 400 });
  }
  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return mutationError(error);
  }
}
