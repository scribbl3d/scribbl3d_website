import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const testimonial = await prisma.customerTestimonial.findUnique({
            where: { id },
        });
        if (!testimonial)
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const testimonial = await prisma.customerTestimonial.update({
            where: { id },
            data: {
                quote: body.quote,
                name: body.name,
                role: body.role,
                initials: body.initials,
                rating: body.rating,
                sortOrder: body.sortOrder,
                isActive: body.isActive,
            },
        });

        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        await prisma.customerTestimonial.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete" },
            { status: 500 },
        );
    }
}
