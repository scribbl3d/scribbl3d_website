import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const carouselItemSchema = z.object({
    type: z.enum(["image", "video"]),
    src: z.string().url(),
    duration: z.number().int().positive(),
});

export async function PUT(request: Request, { params }) {
    try {
        const { id } = params;

        const formData = await request.formData();

        const type = formData.get("type");
        const durationRaw = formData.get("duration");
        const file = formData.get("file") as File | null;

        if (!type || !durationRaw) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const duration = Number(durationRaw);
        if (Number.isNaN(duration)) {
            return NextResponse.json(
                { error: "Invalid duration" },
                { status: 400 }
            );
        }

        const existing = await prisma.carouselItem.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Carousel item not found" },
                { status: 404 }
            );
        }

        let src = existing.src;

        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "carousel",
                            resource_type: type === "video" ? "video" : "image",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    )
                    .end(buffer);
            });

            src = uploadResult.secure_url;
        }

        const validated = carouselItemSchema.parse({
            type,
            duration,
            src,
        });

        const updated = await prisma.carouselItem.update({
            where: { id },
            data: validated,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[CAROUSEL_ADMIN_PUT]", error);
        return NextResponse.json(
            { error: "Failed to update carousel item" },
            { status: 500 }
        );
    }
}

export async function DELETE(_: Request, { params }) {
    await prisma.carouselItem.delete({
        where: { id: params.id },
    });

    return NextResponse.json({ success: true });
}
