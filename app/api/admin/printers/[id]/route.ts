import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;

    try {
        const printer = await prisma.printer.findUnique({
            where: { id: params.id },
            include: {
                images: { orderBy: { sortOrder: "asc" } },
                specifications: { orderBy: { sortOrder: "asc" } },
                features: { orderBy: { sortOrder: "asc" } },
                applications: { orderBy: { sortOrder: "asc" } },
                downloads: { orderBy: { sortOrder: "asc" } },
            },
        });

        if (!printer) {
            return NextResponse.json(
                { error: "Printer not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(printer);
    } catch (error) {
        console.error("[PRINTER_GET]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;

    try {
        const formData = await req.formData();

        const existingPrinter = await prisma.printer.findUnique({
            where: { id: params.id },
            select: { slug: true },
        });

        const slug =
            (formData.get("slug") as string) || existingPrinter?.slug || "";
        const inStock = formData.get("inStock") !== "false"; // defaults to true

        const specifications = JSON.parse(
            (formData.get("specifications") as string) || "[]",
        );
        const features = JSON.parse(
            (formData.get("features") as string) || "[]",
        );
        const applications = JSON.parse(
            (formData.get("applications") as string) || "[]",
        );
        const downloads = JSON.parse(
            (formData.get("downloads") as string) || "[]",
        );

        const materialAttributes: {
            attributeKey: string;
            attributeValue: string;
        }[] = [];

        specifications.forEach((spec: any) => {
            const isMaterialSpec =
                spec.label?.toLowerCase().includes("material") ||
                spec.category?.toLowerCase().includes("material");

            if (!isMaterialSpec || !spec.value) return;

            const uniqueMaterials = Array.from(
                new Set(
                    spec.value
                        .split(",")
                        .map((v: string) => v.trim().toUpperCase())
                        .filter(Boolean),
                ),
            );

            uniqueMaterials.forEach((material) => {
                materialAttributes.push({
                    attributeKey: "material",
                    attributeValue: material as string,
                });
            });
        });

        const existingImages = JSON.parse(
            (formData.get("existingImages") as string) || "[]",
        );
        const newFiles = formData.getAll("newImages") as File[];
        const newMetaStrings = formData.getAll("newImagesMeta") as string[];

        const finalImageRecords: {
            url: string;
            isMain: boolean;
            sortOrder: number;
        }[] = [...existingImages];

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

                            transformation: [
                                {
                                    width: 1600,
                                    height: 1600,
                                    crop: "pad",
                                    background: "white",
                                    quality: "auto:good",
                                    fetch_format: "auto",
                                },
                            ],
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        },
                    )
                    .end(buffer);
            });

            finalImageRecords.push({
                url: uploadResult.secure_url,
                isMain: meta.isMain || false,
                sortOrder: meta.sortOrder ?? i,
            });
        }

        const [updatedPrinter] = await prisma.$transaction([
            prisma.printer.update({
                where: { id: params.id },
                data: {
                    name: formData.get("name") as string,
                    slug,
                    brand: formData.get("brand") as string,
                    technology: formData.get("technology") as string,
                    experience: formData.get("experience") as string,
                    price: parseInt(formData.get("price") as string),
                    originalPrice: formData.get("originalPrice")
                        ? parseInt(formData.get("originalPrice") as string)
                        : null,
                    discount: parseInt(formData.get("discount") as string),
                    description: formData.get("description") as string,
                    shortDescription: formData.get(
                        "shortDescription",
                    ) as string,
                    volumeLength: parseInt(
                        formData.get("volumeLength") as string,
                    ),
                    volumeWidth: parseInt(
                        formData.get("volumeWidth") as string,
                    ),
                    volumeHeight: parseInt(
                        formData.get("volumeHeight") as string,
                    ),
                    volumeMax: parseInt(formData.get("volumeMax") as string),
                    warrantyYears: parseInt(
                        formData.get("warrantyYears") as string,
                    ),
                    weight: parseInt(formData.get("weight") as string) || 0,
                    freeInstallation:
                        formData.get("freeInstallation") === "true",
                    inStock,
                },
            }),

            prisma.printerImage.deleteMany({ where: { printerId: params.id } }),
            prisma.printerImage.createMany({
                data: finalImageRecords.map((img) => ({
                    printerId: params.id,
                    url: img.url,
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                })),
            }),

            prisma.printerSpecification.deleteMany({
                where: { printerId: params.id },
            }),
            prisma.printerSpecification.createMany({
                data: specifications.map((spec: any, index: number) => ({
                    printerId: params.id,
                    category: spec.category,
                    label: spec.label,
                    value: spec.value,
                    sortOrder: index,
                })),
            }),

            prisma.printerAttribute.deleteMany({
                where: { printerId: params.id, attributeKey: "material" },
            }),
            prisma.printerAttribute.createMany({
                data: materialAttributes.map((attr) => ({
                    printerId: params.id,
                    attributeKey: attr.attributeKey,
                    attributeValue: attr.attributeValue,
                })),
            }),

            prisma.printerFeature.deleteMany({
                where: { printerId: params.id },
            }),
            prisma.printerFeature.createMany({
                data: features.map((feat: any, index: number) => ({
                    printerId: params.id,
                    title: feat.title,
                    sortOrder: index,
                })),
            }),

            prisma.printerApplication.deleteMany({
                where: { printerId: params.id },
            }),
            prisma.printerApplication.createMany({
                data: applications.map((app: any, index: number) => ({
                    printerId: params.id,
                    name: app.name,
                    sortOrder: index,
                })),
            }),

            prisma.printerDownload.deleteMany({
                where: { printerId: params.id },
            }),
            prisma.printerDownload.createMany({
                data: downloads.map((doc: any, index: number) => ({
                    printerId: params.id,
                    title: doc.title,
                    description: doc.description,
                    downloadUrl: doc.downloadUrl,
                    sortOrder: index,
                })),
            }),
        ]);

        return NextResponse.json(updatedPrinter);
    } catch (error) {
        console.error("[PRINTER_PUT]", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

/* ============================================================================
   DELETE – Delete printer
   ============================================================================ */
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> },
) {
    const params = await props.params;

    try {
        const printer = await prisma.printer.findUnique({
            where: { id: params.id },
            include: { images: true },
        });

        if (!printer) {
            return NextResponse.json(
                { error: "Printer not found" },
                { status: 404 },
            );
        }

        for (const img of printer.images) {
            try {
                const publicId = img.url
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .replace(/\.[^/.]+$/, "");
                await cloudinary.uploader.destroy(publicId);
            } catch {
                console.warn("Cloudinary delete failed:", img.url);
            }
        }

        await prisma.printer.delete({ where: { id: params.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PRINTER_DELETE]", error);
        return NextResponse.json(
            { error: "Failed to delete printer" },
            { status: 500 },
        );
    }
}
