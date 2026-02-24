import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

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

        // Extract basic info for renaming logic
        const fullName = (formData.get("fullName") as string) || "Anonymous";
        const cleanName = fullName.trim().replace(/\s+/g, "_"); // Replace spaces with underscores

        // Generate timestamp (YYYYMMDD_HHMMSS)
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T]/g, "")
            .split(".")[0];

        /* ───────────── Files & Renaming Logic ───────────── */
        const files = formData.getAll("files") as File[];
        const designFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file instanceof File && file.size > 0) {
                // Construct custom name: fullname_datetime_index
                const customFileName = `${cleanName}_${timestamp}_${i + 1}`;

                const url = await uploadToCloudinary(file, customFileName);
                designFiles.push(url);
            }
        }

        /* ───────────── Data Parsing ───────────── */
        const colors = JSON.parse((formData.get("colors") as string) || "[]");
        const quantityType = formData.get("quantityType") as string;
        const quantityNumberRaw = formData.get("quantityNumber");

        // Automation: If single unit, force count to 1. Else, parse input.
        const quantityNumber =
            quantityType === "single"
                ? 1
                : quantityNumberRaw
                  ? Number(quantityNumberRaw)
                  : null;

        /* ───────────── Prisma Database Entry ───────────── */
        const response = await prisma.prototypingRequest.create({
            data: {
                projectType: (formData.get("projectType") as string) || "",
                technology: (formData.get("technology") as string) || "",
                material: (formData.get("material") as string) || "",
                materialSubtype: (formData.get("subtype") as string) || null,
                colors: colors,
                designFiles: designFiles,
                quantityType: quantityType || null,
                quantityNumber: quantityNumber,
                specialRequirements: (formData.get("notes") as string) || null,
                fullName: fullName,
                email: (formData.get("email") as string) || "",
                phone: (formData.get("phone") as string) || "",
                address: (formData.get("address") as string) || "",
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
