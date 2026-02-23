import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

/* ───────────── Cloudinary Config ───────────── */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* ───────────── Upload Helper ───────────── */
async function uploadToCloudinary(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "prototyping-requests",
                    resource_type: "raw",
                    use_filename: true,
                    unique_filename: true,
                },
                (err, res) => {
                    if (err || !res?.secure_url) reject(err);
                    else resolve(res.secure_url);
                },
            )
            .end(buffer);
    });
}

/* ───────────── POST ───────────── */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        /* ───────────── Files ───────────── */
        const files = formData.getAll("files") as File[];
        const designFiles: string[] = [];

        for (const file of files) {
            if (file instanceof File && file.size > 0) {
                const url = await uploadToCloudinary(file);
                designFiles.push(url);
            }
        }

        /* ───────────── Colors ───────────── */
        const colors = JSON.parse(
            (formData.get("colors") as string) || "[]",
        ) as string[];

        /* ───────────── Quantity ───────────── */
        const quantityNumberRaw = formData.get("quantityNumber");
        const quantityNumber = quantityNumberRaw
            ? Number(quantityNumberRaw)
            : null;

        /* ───────────── Prisma Create ───────────── */
        const response = await prisma.prototypingRequest.create({
            data: {
                projectType: formData.get("projectType") as string,
                technology: formData.get("technology") as string,
                material: formData.get("material") as string,
                materialSubtype: (formData.get("subtype") as string) || null,

                colors,
                designFiles,

                quantityType: (formData.get("quantityType") as string) || null,
                quantityNumber,

                specialRequirements: (formData.get("notes") as string) || null,

                fullName: formData.get("fullName") as string,
                email: formData.get("email") as string,
                phone: formData.get("phone") as string,
                company: (formData.get("company") as string) || null,
            },
        });

        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        console.error("Prototyping submit failed:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit request" },
            { status: 500 },
        );
    }
}

/* ───────────── GET (Admin / Dashboard) ───────────── */
export async function GET() {
    try {
        const requests = await prisma.prototypingRequest.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch requests" },
            { status: 500 },
        );
    }
}
