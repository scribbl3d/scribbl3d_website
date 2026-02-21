import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(file: File): Promise<string | null> {
    try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using upload_stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "small-batch-manufacturing",
                    resource_type: "raw", // For non-image files like .stl, .obj, etc.
                    public_id: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for public_id
                    use_filename: true,
                    unique_filename: false, // We already have timestamp in filename
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            uploadStream.end(buffer);
        });

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Log the received form data keys for debugging
        console.log("Form data keys:", Array.from(formData.keys()));

        // Handle file upload to Cloudinary
        const designFile = formData.get("designFile");
        let designFileUrl: string | null = null;

        if (designFile instanceof File && designFile.size > 0) {
            designFileUrl = await uploadToCloudinary(designFile);
        }

        const data = {
            designFile: designFileUrl, // Now stores Cloudinary URL instead of just filename
            quantity: parseInt(formData.get("quantity") as string) || 0,
            requirements: (formData.get("requirements") as string) ?? "",
            technology: (formData.get("technology") as string) ?? "",
            material: (formData.get("material") as string) ?? "",
            materialSubtype: (formData.get("materialSubtype") as string) ?? "",
            productColor: (formData.get("productColor") as string) ?? "",
            filamentColor: (formData.get("filamentColor") as string) ?? "",
            resinColor: (formData.get("resinColor") as string) ?? "",
            firstName: (formData.get("firstName") as string) ?? "",
            lastName: (formData.get("lastName") as string) ?? "",
            email: (formData.get("email") as string) ?? "",
            phone: (formData.get("phone") as string) ?? "",
            company: (formData.get("company") as string) ?? "",
        };

        // Log the processed data for debugging
        console.log("Processed data:", data);

        const response = await prisma.smallBatchManufacturingResponse.create({
            data: data,
        });

        return NextResponse.json({ success: true, data: response });
    } catch (error: any) {
        // Detailed error logging
        console.error("Error details:", {
            name: error?.name || "Unknown error",
            message: error?.message || "No error message available",
            stack: error?.stack || "No stack trace available",
        });

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create small batch manufacturing response",
            },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const responses = await prisma.smallBatchManufacturingResponse.findMany(
            {
                orderBy: { createdAt: "desc" },
            },
        );
        return NextResponse.json(responses);
    } catch (error) {
        console.error(
            "Failed to fetch small batch manufacturing responses:",
            error,
        );
        return NextResponse.json(
            { error: "Failed to fetch small batch manufacturing responses" },
            { status: 500 },
        );
    }
}
