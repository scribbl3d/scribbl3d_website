import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email/index";
import {
    sanitizeWithLimit, sanitizeOptional,
    isValidEmail, normalizeEmail, isValidPhone, normalizePhone,
    checkRequired, isRateLimited, isValidDesignFile,
} from "@/lib/validation";

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

        // Rate limit by IP
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(`form3d:${ip}`, 5, 60_000)) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        // Extract and sanitize text fields first for validation
        const firstName = sanitizeWithLimit((formData.get("firstName") as string) || "", 100);
        const lastName = sanitizeWithLimit((formData.get("lastName") as string) || "", 100);
        const email = ((formData.get("email") as string) || "").trim().toLowerCase();
        const phone = ((formData.get("phone") as string) || "").trim();
        const requirement = sanitizeWithLimit((formData.get("requirement") as string) || "", 2000);
        const fileExtension = sanitizeWithLimit((formData.get("fileExtension") as string) || "", 50);

        // Validate required fields
        const reqError = checkRequired([
            { value: firstName, name: "First Name" },
            { value: lastName, name: "Last Name" },
            { value: email, name: "Email" },
            { value: phone, name: "Phone" },
            { value: requirement, name: "Requirement" },
            { value: fileExtension, name: "File Extension" },
        ]);
        if (reqError) {
            return NextResponse.json({ error: reqError }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }
        if (!isValidPhone(phone)) {
            return NextResponse.json({ error: "Invalid phone number (10 digits required)" }, { status: 400 });
        }

        // Validate uploaded files
        const fileReference = formData.get("fileReference");
        if (fileReference instanceof File && fileReference.size > 0) {
            const fileCheck = isValidDesignFile(fileReference);
            if (!fileCheck.valid) {
                return NextResponse.json({ error: `Reference file: ${fileCheck.error}` }, { status: 400 });
            }
        }
        const additionalFile = formData.get("additionalFile");
        if (additionalFile instanceof File && additionalFile.size > 0) {
            const fileCheck = isValidDesignFile(additionalFile);
            if (!fileCheck.valid) {
                return NextResponse.json({ error: `Additional file: ${fileCheck.error}` }, { status: 400 });
            }
        }

        // Upload files to Cloudinary
        let fileReferenceUrl: string | null = null;
        if (fileReference instanceof File && fileReference.size > 0) {
            fileReferenceUrl = await uploadToCloudinary(fileReference, "form3d-requests/reference");
        }
        let additionalFileUrl: string | null = null;
        if (additionalFile instanceof File && additionalFile.size > 0) {
            additionalFileUrl = await uploadToCloudinary(additionalFile, "form3d-requests/additional");
        }

        // Sanitize remaining fields
        const address = sanitizeOptional((formData.get("address") as string), 500) || "";
        const company = sanitizeOptional((formData.get("company") as string), 200);
        const productionType = sanitizeOptional((formData.get("productionType") as string), 100) || "";
        const printingTechnology = sanitizeOptional((formData.get("printingTechnology") as string), 100);
        const materialFamily = sanitizeOptional((formData.get("materialFamily") as string), 100);
        const material = sanitizeOptional((formData.get("material") as string), 100);
        const color = sanitizeOptional((formData.get("color") as string), 100);
        const quantityStr = (formData.get("quantity") as string) || "";
        const quantity = quantityStr ? Number.parseInt(quantityStr, 10) : null;

        const formResponse = await prisma.form3DResponse.create({
            data: {
                fileReference: fileReferenceUrl,
                additionalFile: additionalFileUrl,
                requirement,
                fileExtension,
                productionType,
                quantity: Number.isNaN(quantity as number) ? null : quantity,
                printingTechnology,
                materialFamily,
                material,
                color,
                firstName,
                lastName,
                email: normalizeEmail(email),
                phone: normalizePhone(phone),
                address,
                company,
            },
        });

        // Fire-and-forget admin email notification
        console.log("[Admin Email] Attempting to send Form3D admin notification...");
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
        }).then((res) => console.log("[Admin Email] Form3D notification result:", JSON.stringify(res)))
          .catch((err) => console.error("[Admin Email] Form3D notification failed:", err));

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
