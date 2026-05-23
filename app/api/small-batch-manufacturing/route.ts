import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(
    file: File,
    customName: string,
): Promise<string | null> {
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "small-batch-manufacturing",
                        resource_type: "raw",
                        public_id: customName,
                        use_filename: true,
                        unique_filename: false,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    },
                )
                .end(buffer);
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

        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const address = formData.get("address") as string;
        const company = (formData.get("company") as string) || null;
        const applyToAll = formData.get("applyToAll") === "true";

        console.log("\n========================================");
        console.log("📥 FORM SUBMISSION RECEIVED");
        console.log("========================================");
        console.log(`Full Name: ${fullName}`);
        console.log(`Apply To All: ${applyToAll}`);

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T]/g, "")
            .split(".")[0];
        const cleanName = fullName.trim().replace(/\s+/g, "_");

        const productCount = parseInt(
            (formData.get("productCount") as string) || "0",
        );

        console.log(`\nProcessing ${productCount} products...\n`);

        const productDataArray: any[] = [];

        for (let i = 0; i < productCount; i++) {
            const file = formData.get(`file_${i}`) as File;
            const specsRaw = formData.get(`productSpecs_${i}`) as string;

            console.log(`\n--- PRODUCT ${i + 1} ---`);
            console.log(`File name: ${file?.name}`);
            console.log(`Specs received (raw): ${specsRaw}`);

            if (file && file.size > 0 && specsRaw) {
                const specs = JSON.parse(specsRaw);

                console.log(`✅ Parsed specs:`, {
                    tech: specs.tech,
                    material: specs.material,
                    subtype: specs.subtype,
                    colorMode: specs.colorMode,
                    colors: specs.colors,
                    quantity: specs.quantity,
                });

                const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
                const customFileName = `${cleanName}_${timestamp}_batch_${i + 1}${ext}`;
                const fileUrl = await uploadToCloudinary(file, customFileName);

                if (fileUrl) {
                    const productData = {
                        designFile: fileUrl,
                        quantity: parseInt(specs.quantity) || 0,
                        notes: specs.notes || "",
                        technology: specs.tech,
                        material: specs.material,
                        materialSubtype: specs.subtype || null,
                        colorMode: specs.colorMode,
                        colors: specs.colors || [],
                    };

                    console.log(`📦 Data to be saved to DB:`, productData);
                    productDataArray.push(productData);
                } else {
                    console.error(`❌ Failed to upload file for product ${i}`);
                }
            } else {
                console.warn(`⚠️ Product ${i} skipped - missing file or specs`);
                if (!file) console.warn(`  - No file`);
                if (file && file.size === 0) console.warn(`  - File size is 0`);
                if (!specsRaw) console.warn(`  - No specs`);
            }
        }

        console.log(`\n========================================`);
        console.log(`FINAL PRODUCT DATA ARRAY:`);
        console.log(JSON.stringify(productDataArray, null, 2));
        console.log(`========================================\n`);

        // Atomic transaction to create the request and all nested products
        const result = await prisma.smallBatchRequest.create({
            data: {
                fullName,
                email,
                phone,
                address,
                company,
                products: {
                    create: productDataArray,
                },
            },
            include: {
                products: true,
            },
        });

        console.log(`✅ DATABASE SAVE SUCCESSFUL`);
        console.log(`Request ID: ${result.id}`);
        console.log(`Products created: ${result.products.length}`);
        console.log(`\nSaved product data from DB:`);
        result.products.forEach((p, i) => {
            console.log(`\nProduct ${i + 1}:`);
            console.log(`  - technology: ${p.technology}`);
            console.log(`  - material: ${p.material}`);
            console.log(`  - materialSubtype: ${p.materialSubtype}`);
            console.log(`  - colorMode: ${p.colorMode}`);
            console.log(`  - colors: ${JSON.stringify(p.colors)}`);
        });
        console.log(`\n========================================\n`);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error("❌ API Error:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
        });
        return NextResponse.json(
            { success: false, error: error.message || "Submission failed" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const responses = await prisma.smallBatchRequest.findMany({
            include: { products: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(responses);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 },
        );
    }
}
