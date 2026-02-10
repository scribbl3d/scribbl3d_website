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
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using upload_stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
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
                service: (formData.get("service") as string) || "",
                fileReference: fileReferenceUrl,
                requirement: (formData.get("requirement") as string) || "",
                fileExtension: (formData.get("fileExtension") as string) || "",
                prototype: (formData.get("prototype") as string) || "",
                prototypeOption:
                    (formData.get("prototypeOption") as string) || "",
                printingTechnology:
                    (formData.get("printingTechnology") as string) || "",
                material: (formData.get("material") as string) || "",
                materialType: (formData.get("materialType") as string) || "",
                materialDescription:
                    (formData.get("materialDescription") as string) || "",
                quantity: quantityStr ? parseInt(quantityStr) : null,
                productColor: (formData.get("productColor") as string) || "",
                filamentColor: (formData.get("filamentColor") as string) || "",
                resinColor: (formData.get("resinColor") as string) || "",
                additionalFile: additionalFileUrl,
                firstName: (formData.get("firstName") as string) || "",
                lastName: (formData.get("lastName") as string) || "",
                email: (formData.get("email") as string) || "",
                phone: (formData.get("phone") as string) || "",
                company: (formData.get("company") as string) || "",
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
            orderBy: {
                createdAt: "desc",
            },
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
