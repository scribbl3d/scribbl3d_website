import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { section } = await request.json();

        if (!section) {
            return NextResponse.json({ error: 'Section is required' }, { status: 400 });
        }

        await prisma.adminViewTracker.upsert({
            where: { section },
            update: { lastViewedAt: new Date() },
            create: { section, lastViewedAt: new Date() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking section as viewed:', error);
        return NextResponse.json({ error: 'Failed to mark as viewed' }, { status: 500 });
    }
}
