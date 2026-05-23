import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

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

        const firstName = (formData.get("firstName") as string) || "";
        const lastName = (formData.get("lastName") as string) || "";
        const email = (formData.get("email") as string) || "";
        const phone = (formData.get("phone") as string) || "";
        const address = (formData.get("address") as string) || "";
        const company = (formData.get("company") as string) || null;
        const requirement = (formData.get("requirement") as string) || "";
        const fileExtension = (formData.get("fileExtension") as string) || "";
        const productionType = (formData.get("productionType") as string) || "";
        const printingTechnology = (formData.get("printingTechnology") as string) || null;
        const materialFamily = (formData.get("materialFamily") as string) || null;
        const material = (formData.get("material") as string) || null;
        const color = (formData.get("color") as string) || null;

        const formResponse = await prisma.form3DResponse.create({
            data: {
                fileReference: fileReferenceUrl,
                additionalFile: additionalFileUrl,
                requirement,
                fileExtension,
                productionType,
                quantity: quantityStr ? parseInt(quantityStr) : null,
                printingTechnology,
                materialFamily,
                material,
                color,
                firstName,
                lastName,
                email,
                phone,
                address,
                company,
            },
        });

        // Fire-and-forget admin email notification
        sendAdminNotification({
            type: "form3d-response",
            details: {
                "Name": `${firstName} ${lastName}`.trim() || "—",
                "Email": email || "—",
                "Phone": phone || "—",
                "Company": company,
                "Address": address || "—",
                "Requirement": requirement || "—",
                "File Extension": fileExtension || "—",
                "Production Type": productionType || "—",
                "Quantity": quantityStr || "—",
                "Printing Technology": printingTechnology,
                "Material Family": materialFamily,
                "Material": material,
                "Color": color,
                "Reference File": fileReferenceUrl ? "Attached" : "None",
                "Additional File": additionalFileUrl ? "Attached" : "None",
            },
        }).catch((err) => console.error("[Admin Email] Form3D notification failed:", err));

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
