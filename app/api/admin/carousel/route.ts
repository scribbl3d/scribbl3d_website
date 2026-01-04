import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

const carouselItemSchema = z.object({
    type: z.enum(["image", "video"]),
    duration: z.number().int().positive(),
});

export async function GET() {
    try {
        const items = await prisma.carouselItem.findMany({
            orderBy: { createdAt: "asc" },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("[CAROUSEL_ADMIN_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch carousel items" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File | null;
        const type = formData.get("type") as "image" | "video" | null;
        const duration = Number(formData.get("duration"));

        if (!file || !type || !duration) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        carouselItemSchema.parse({ type, duration });

        const buffer = Buffer.from(await file.arrayBuffer());

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

        const item = await prisma.carouselItem.create({
            data: {
                type,
                src: uploadResult.secure_url,
                duration,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("[CAROUSEL_ADMIN_POST]", error);
        return NextResponse.json(
            { error: "Failed to create carousel item" },
            { status: 500 }
        );
    }
}
