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
async function uploadToCloudinary(
    file: File,
    folder: string,
): Promise<string | null> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: "raw",
                    public_id: file.name,
                    use_filename: true,
                    unique_filename: false,
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

        // Handle file uploads to Cloudinary
        const fileReference = formData.get("fileReference");
        let fileReferenceUrl: string | null = null;

        if (fileReference instanceof File && fileReference.size > 0) {
            fileReferenceUrl = await uploadToCloudinary(
                fileReference,
                "form3d-requests/reference",
            );
        }

        const additionalFile = formData.get("additionalFile");
        let additionalFileUrl: string | null = null;

        if (additionalFile instanceof File && additionalFile.size > 0) {
            additionalFileUrl = await uploadToCloudinary(
                additionalFile,
                "form3d-requests/additional",
            );
        }

        const quantityStr = formData.get("quantity") as string;

        const formResponse = await prisma.form3DResponse.create({
            data: {
                // Files
                fileReference: fileReferenceUrl,
                additionalFile: additionalFileUrl,

                // Project details
                requirement: (formData.get("requirement") as string) || "",
                fileExtension: (formData.get("fileExtension") as string) || "",

                // Manufacturing / production
                productionType:
                    (formData.get("productionType") as string) || "",
                quantity: quantityStr ? parseInt(quantityStr) : null,

                // Technology, material & colour
                printingTechnology:
                    (formData.get("printingTechnology") as string) || null,
                materialFamily:
                    (formData.get("materialFamily") as string) || null,
                material: (formData.get("material") as string) || null,
                color: (formData.get("color") as string) || null,

                // Customer details
                firstName: (formData.get("firstName") as string) || "",
                lastName: (formData.get("lastName") as string) || "",
                email: (formData.get("email") as string) || "",
                phone: (formData.get("phone") as string) || "",
                address: (formData.get("address") as string) || "",
                company: (formData.get("company") as string) || null,
            },
        });

        return NextResponse.json(formResponse);
    } catch (error) {
        console.error("Failed to create form response:", error);
        return NextResponse.json(
            { error: "Failed to create form response" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const formResponses = await prisma.form3DResponse.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(formResponses);
    } catch (error) {
        console.error("Failed to fetch form responses:", error);
        return NextResponse.json(
            { error: "Failed to fetch form responses" },
            { status: 500 },
        );
    }
}
