import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const testimonials = await prisma.customerTestimonial.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(testimonials);
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const body = await req.json();

        const testimonial = await prisma.customerTestimonial.create({
            data: {
                quote: body.quote,
                name: body.name,
                role: body.role || "",
                initials:
                    body.initials ||
                    body.name
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2),
                rating: body.rating ?? 5,
                sortOrder: body.sortOrder ?? 0,
                isActive: body.isActive ?? true,
            },
        });

        return NextResponse.json(testimonial, { status: 201 });
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return NextResponse.json(
            { error: "Failed to create" },
            { status: 500 },
        );
    }
}
