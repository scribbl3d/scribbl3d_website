import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const carouselItemSchema = z.object({
    type: z.enum(["image", "video"]),
    src: z.string().url(),
    duration: z.number().int().positive(),
});

export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const item = await prisma.carouselItem.findUnique({ where: { id } });

    if (!item) {
        return NextResponse.json(
            { error: "Carousel item not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(item);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const validated = carouselItemSchema.parse(body);

        const item = await prisma.carouselItem.update({
            where: { id },
            data: validated,
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error("[CAROUSEL_ADMIN_PUT]", error);
        return NextResponse.json(
            { error: "Failed to update carousel item" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    await prisma.carouselItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
