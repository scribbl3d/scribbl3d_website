import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email/index";
import {
    sanitizeWithLimit, sanitizeOptional, sanitizeStringArray, safeJsonParse,
    isValidEmail, normalizeEmail, isValidPhone, normalizePhone,
    checkRequired, isRateLimited, isValidDesignFile,
} from "@/lib/validation";

/* ───────────── Cloudinary Config ───────────── */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* ───────────── Upload Helper with Custom Naming ───────────── */
async function uploadToCloudinary(
    file: File,
    customName: string,
): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "prototyping-requests",
                    resource_type: "raw", // Needed for STL/STEP files
                    public_id: customName, // Sets the custom filename
                    use_filename: true,
                    unique_filename: false, // Prevents Cloudinary from adding random suffixes
                },
                (err, res) => {
                    if (err || !res?.secure_url) reject(err);
                    else resolve(res.secure_url);
                },
            )
            .end(buffer);
    });
}

/* ───────────── POST (Submit Request) ───────────── */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Rate limit by IP
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(`prototyping:${ip}`, 5, 60_000)) {
            return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
        }

        // Extract and sanitize text fields
        const fullName = sanitizeWithLimit((formData.get("fullName") as string) || "", 200);
        const email = ((formData.get("email") as string) || "").trim().toLowerCase();
        const phone = ((formData.get("phone") as string) || "").trim();
        const address = sanitizeOptional((formData.get("address") as string), 500);
        const company = sanitizeOptional((formData.get("company") as string), 200);
        const projectType = sanitizeWithLimit((formData.get("projectType") as string) || "", 100);
        const technology = sanitizeWithLimit((formData.get("technology") as string) || "", 100);
        const materialVal = sanitizeWithLimit((formData.get("material") as string) || "", 100);
        const materialSubtype = sanitizeOptional((formData.get("subtype") as string), 100);
        const specialRequirements = sanitizeOptional((formData.get("notes") as string), 2000);

        // Validate required fields
        const reqError = checkRequired([
            { value: fullName, name: "Full Name" },
            { value: email, name: "Email" },
            { value: phone, name: "Phone" },
            { value: projectType, name: "Project Type" },
            { value: technology, name: "Technology" },
            { value: materialVal, name: "Material" },
        ]);
        if (reqError) {
            return NextResponse.json({ success: false, error: reqError }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
        }
        if (!isValidPhone(phone)) {
            return NextResponse.json({ success: false, error: "Invalid phone number (10 digits required)" }, { status: 400 });
        }

        // File renaming logic
        const cleanName = fullName.trim().replace(/\s+/g, "_");
        const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];

        /* ───────────── Files & Validation ───────────── */
        const files = formData.getAll("files") as File[];
        const designFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file instanceof File && file.size > 0) {
                const fileCheck = isValidDesignFile(file);
                if (!fileCheck.valid) {
                    return NextResponse.json({ success: false, error: `File ${i + 1}: ${fileCheck.error}` }, { status: 400 });
                }
                const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
                const customFileName = `${cleanName}_${timestamp}_${i + 1}${ext}`;
                const url = await uploadToCloudinary(file, customFileName);
                designFiles.push(url);
            }
        }

        /* ───────────── Data Parsing ───────────── */
        const colors = sanitizeStringArray(safeJsonParse((formData.get("colors") as string), []));
        const quantityType = sanitizeOptional((formData.get("quantityType") as string), 50);
        const quantityNumberRaw = formData.get("quantityNumber");

        const quantityNumber =
            quantityType === "single"
                ? 1
                : quantityNumberRaw
                  ? Number(quantityNumberRaw)
                  : null;

        /* ───────────── Prisma Database Entry ───────────── */
        const response = await prisma.prototypingRequest.create({
            data: {
                projectType,
                technology,
                material: materialVal,
                materialSubtype,
                colors,
                designFiles,
                quantityType,
                quantityNumber: Number.isNaN(quantityNumber as number) ? null : quantityNumber,
                specialRequirements,
                fullName,
                email: normalizeEmail(email),
                phone: normalizePhone(phone),
                address,
                company,
            },
        });

        // Fire-and-forget admin email notification
        console.log("[Admin Email] Attempting to send Prototyping admin notification...");
        sendAdminNotification({
            type: "prototyping-request",
            details: {
                "Name": fullName || "—",
                "Email": email || "—",
                "Phone": phone || "—",
                "Company": company,
                "Address": address || "—",
                "Project Type": projectType || "—",
                "Technology": technology || "—",
                "Material": materialVal || "—",
                "Material Subtype": materialSubtype,
                "Colors": Array.isArray(colors) ? colors.join(", ") : "—",
                "Quantity Type": quantityType || "—",
                "Quantity": quantityNumber != null ? String(quantityNumber) : "—",
                "Special Requirements": specialRequirements,
                "Design Files": designFiles.length > 0 ? `${designFiles.length} file(s) uploaded` : "None",
            },
        }).then((res) => console.log("[Admin Email] Prototyping notification result:", JSON.stringify(res)))
          .catch((err) => console.error("[Admin Email] Prototyping notification failed:", err));

        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        console.error("Prototyping submit failed:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit request" },
            { status: 500 },
        );
    }
}

/* ───────────── GET (Fetch for Admin) ───────────── */
export async function GET() {
    try {
        const requests = await prisma.prototypingRequest.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("Failed to fetch requests:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
