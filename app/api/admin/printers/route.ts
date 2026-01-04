import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

/* =========================
   GET – List printers (Grid)
   ========================= */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const sortBy = searchParams.get("sortBy") || "name";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { contains: search, mode: "insensitive" } },
            ];
        }

        const orderBy: any = {};
        if (sortBy === "name") orderBy.name = "asc";
        else if (sortBy === "price") orderBy.price = "asc";
        else if (sortBy === "technology") orderBy.technology = "asc";
        else if (sortBy === "updatedAt") orderBy.updatedAt = "desc";

        const [printers, total] = await Promise.all([
            prisma.printer.findMany({
                where,
                orderBy,
                skip,
                take: limit,
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

        // 🔑 IMPORTANT: add imageUrl for PrinterGrid
        const formattedPrinters = printers.map((p) => ({
            ...p,
            imageUrl: p.images[0]?.url || null,
        }));

        return NextResponse.json({
            printers: formattedPrinters,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("[PRINTER_LIST]", error);
        return NextResponse.json(
            { error: "Failed to fetch printers" },
            { status: 500 }
        );
    }
}

/* =========================
   POST – Create new printer
   ========================= */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // 1️⃣ Basic fields
        const name = formData.get("name") as string;
        let slug = (formData.get("slug") as string) || "";
        if (!slug) {
            slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
        }

        const price = parseInt(formData.get("price") as string);
        const originalPrice = formData.get("originalPrice")
            ? parseInt(formData.get("originalPrice") as string)
            : null;
        const discount = parseInt((formData.get("discount") as string) || "0");

        const vL = parseInt(formData.get("volumeLength") as string);
        const vW = parseInt(formData.get("volumeWidth") as string);
        const vH = parseInt(formData.get("volumeHeight") as string);
        const volumeMax = Math.max(vL, vW, vH);

        // 2️⃣ Parse JSON arrays
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

        // 3️⃣ Upload images → Cloudinary
        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const imageRecords: {
            url: string;
            isMain: boolean;
            sortOrder: number;
        }[] = [];

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const meta = JSON.parse(newMetaStrings[i] || "{}");

            const buffer = Buffer.from(await file.arrayBuffer());

            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: `printers/${slug}`,
                            resource_type: "image",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    )
                    .end(buffer);
            });

            imageRecords.push({
                url: uploadResult.secure_url,
                isMain: meta.isMain || false,
                sortOrder: meta.sortOrder ?? i,
            });
        }

        // 4️⃣ Create printer
        const newPrinter = await prisma.printer.create({
            data: {
                name,
                slug,
                brand: formData.get("brand") as string,
                technology: formData.get("technology") as string,
                experience: formData.get("experience") as string,
                price,
                originalPrice,
                discount,
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
            },
        });

        return NextResponse.json(newPrinter, { status: 201 });
    } catch (error) {
        console.error("[PRINTER_POST]", error);
        return NextResponse.json(
            { error: "Failed to create printer" },
            { status: 500 }
        );
    }
}
