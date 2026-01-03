import { saveFileLocally } from "@/lib/file-upload";
import { prisma } from "@/lib/prisma"; // Use your singleton instance
import { NextRequest, NextResponse } from "next/server";

// GET - List all printers with pagination and search
// (Kept your original logic exactly as is)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "name";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
            ];
        }

        // Build orderBy
        const orderBy: any = {};
        if (sortBy === "name") orderBy.name = "asc";
        else if (sortBy === "price") orderBy.price = "asc";
        else if (sortBy === "technology") orderBy.technology = "asc";
        else if (sortBy === "updatedAt") orderBy.updatedAt = "desc";

        // Fetch printers
        const [printers, total] = await Promise.all([
            prisma.printer.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                // Include images so you can show thumbnails in the admin table
                include: {
                    images: {
                        where: { isMain: true },
                        take: 1,
                        select: { url: true },
                    },
                },
            }),
            prisma.printer.count({ where }),
        ]);

        return NextResponse.json({
            printers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching printers:", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 }
        );
    }
}

// POST - Create new printer with File Uploads
// (Updated to handle FormData instead of JSON)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // 1. Extract Fields
        const name = formData.get("name") as string;
        // Generate slug if not provided, else clean existing one
        let slug = formData.get("slug") as string;
        if (!slug) {
            slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }

        // Numeric conversions (Frontend sends prices in Paise)
        const price = parseInt(formData.get("price") as string);
        const originalPrice = formData.get("originalPrice")
            ? parseInt(formData.get("originalPrice") as string)
            : null;
        const discount = parseInt((formData.get("discount") as string) || "0");

        // Dimensions
        const vL = parseInt(formData.get("volumeLength") as string);
        const vW = parseInt(formData.get("volumeWidth") as string);
        const vH = parseInt(formData.get("volumeHeight") as string);
        const volumeMax = Math.max(vL, vW, vH); // Recalculate for safety

        // 2. Parse JSON Arrays
        const specifications = JSON.parse(
            (formData.get("specifications") as string) || "[]"
        );
        const features = JSON.parse(
            (formData.get("features") as string) || "[]"
        );
        const applications = JSON.parse(
            (formData.get("applications") as string) || "[]"
        );
        const downloads = JSON.parse(
            (formData.get("downloads") as string) || "[]"
        );

        // 3. Handle Images
        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const imageRecords: { url: string; isMain: boolean; sortOrder: number }[] = [];

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const meta = JSON.parse(newMetaStrings[i] || "{}");

            // Save file to /public/printer_images/[slug]/...
            const publicUrl = await saveFileLocally(file, slug);

            imageRecords.push({
                url: publicUrl,
                isMain: meta.isMain || false,
                sortOrder: meta.sortOrder || i,
            });
        }

        // 4. Create Database Record
        const newPrinter = await prisma.printer.create({
            data: {
                name,
                slug,
                brand: formData.get("brand") as string,
                technology: formData.get("technology") as string,
                experience: formData.get("experience") as string,

                // Pricing
                price,
                originalPrice,
                discount,

                // Dimensions
                volumeLength: vL,
                volumeWidth: vW,
                volumeHeight: vH,
                volumeMax,

                description: formData.get("description") as string,
                shortDescription: formData.get("shortDescription") as string,

                warrantyYears: parseInt(
                    (formData.get("warrantyYears") as string) || "1"
                ),
                freeInstallation: formData.get("freeInstallation") === "true",

                // Relations
                images: { create: imageRecords },
                specifications: {
                    create: specifications.map((spec: any, index: number) => ({
                        category: spec.category,
                        label: spec.label,
                        value: spec.value,
                        sortOrder: index,
                    })),
                },
                features: {
                    create: features.map((feat: any, index: number) => ({
                        title: feat.title,
                        sortOrder: index,
                    })),
                },
                applications: {
                    create: applications.map((app: any, index: number) => ({
                        name: app.name,
                        sortOrder: index,
                    })),
                },
                downloads: {
                    create: downloads.map((doc: any, index: number) => ({
                        title: doc.title,
                        description: doc.description || "",
                        downloadUrl: doc.downloadUrl,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                images: true,
                specifications: true,
            },
        });

        return NextResponse.json(newPrinter, { status: 201 });
    } catch (error) {
        console.error("Error creating printer:", error);
        return NextResponse.json(
            { error: "Failed to create printer" },
            { status: 500 }
        );
    }
}
