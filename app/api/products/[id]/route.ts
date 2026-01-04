import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// import formidable from "formidable";
import { URL_PATHS, urlToAssetPath } from "@/lib/asset-paths";
import cloudinary from "@/lib/cloudinary";
import { z } from "zod";

// CORS helper
function setCORSHeaders(response: NextResponse) {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    return response;
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
        },
    });
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!product) {
            return setCORSHeaders(
                NextResponse.json(
                    { error: "Product not found" },
                    { status: 404 }
                )
            );
        }
        return setCORSHeaders(NextResponse.json(product));
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return setCORSHeaders(
            NextResponse.json(
                { error: "Failed to fetch product" },
                { status: 500 }
            )
        );
    }
}

const productSchema = z.object({
    name: z.string().min(1).max(255),
    price: z.number().int().positive(),
    originalPrice: z.number().int().positive(),
    images: z.array(z.string()).default([]),
    color: z.string().min(1).max(50),
    category: z.string().min(1).max(255),
    tileType: z.string().min(1).max(255),
    discount: z.number().int().positive(),
    length: z.number().optional(),
    breadth: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    productDetails: z.array(z.string()).optional(),
    productdesc: z.string().optional(),
});

function safeJsonParse<T>(
    input: string | null | undefined,
    context: string
): T | null {
    try {
        if (!input) {
            console.error(`[${context}] Empty input provided to JSON.parse`);
            return null;
        }
        const parsed = JSON.parse(input) as T;
        return parsed;
    } catch (error) {
        console.error(`[${context}] Failed to parse JSON:`, input);
        console.error(error);
        return null;
    }
}

async function streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        const formData = await request.formData();
        const files = formData.getAll("images");
        const productDataStr = formData.get("productData") as string | null;
        const keepImagesStr = formData.get("keepImages") as string | null;

        const keepImages = keepImagesStr
            ? (safeJsonParse<string[]>(keepImagesStr, "keepImages") ?? [])
            : [];

        if (!productDataStr) {
            return setCORSHeaders(
                NextResponse.json(
                    { error: "No product data provided" },
                    { status: 400 }
                )
            );
        }

        const productData = safeJsonParse<any>(productDataStr, "productData");
        if (!productData) {
            return setCORSHeaders(
                NextResponse.json(
                    { error: "Invalid product data format" },
                    { status: 400 }
                )
            );
        }

        /* ---------------- Discount ---------------- */

        let discount = Math.round(
            (1 - productData.price / productData.originalPrice) * 100
        );
        if (discount < 1) discount = 1;

        /* ---------------- Images ---------------- */

        const imageUrls: string[] = [...keepImages];

        for (const file of files) {
            const f = file as any;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/webp",
                "image/jpg",
            ];
            const maxSize = 5 * 1024 * 1024;

            if (!allowedTypes.includes(f.type) || f.size > maxSize) {
                console.warn(`Skipped invalid image: ${f?.name}`);
                continue;
            }

            const buffer = Buffer.from(await f.arrayBuffer());

            const uploadResult = await cloudinary.uploader.upload(
                `data:${f.type};base64,${buffer.toString("base64")}`,
                {
                    folder: "product-images",
                    resource_type: "image",
                }
            );

            imageUrls.push(uploadResult.secure_url);
        }

        /* ---------------- Validation ---------------- */

        const validatedData = productSchema.parse({
            ...productData,
            images: imageUrls,
            discount,
        });

        /* ---------------- Prisma Data ---------------- */

        const prismaData: any = {
            ...validatedData,
        };

        if (productData.length !== undefined)
            prismaData.length = Number(productData.length);
        if (productData.breadth !== undefined)
            prismaData.breadth = Number(productData.breadth);
        if (productData.height !== undefined)
            prismaData.height = Number(productData.height);
        if (productData.weight !== undefined)
            prismaData.weight = Number(productData.weight);
        if (productData.description !== undefined)
            prismaData.description = productData.description;
        if (productData.features) prismaData.features = productData.features;
        if (productData.productDetails)
            prismaData.productDetails = productData.productDetails;
        if (productData.productdesc)
            prismaData.productdesc = productData.productdesc;

        prismaData.images = imageUrls;

        /* ---------------- Update ---------------- */

        const product = await prisma.product.update({
            where: { id },
            data: prismaData,
        });

        return setCORSHeaders(NextResponse.json(product));
    } catch (error) {
        console.error("Failed to update product:", error);

        if (error instanceof z.ZodError) {
            return setCORSHeaders(
                NextResponse.json(
                    {
                        error: "Validation failed",
                        details: error.errors.map((err) => ({
                            path: err.path.join("."),
                            message: err.message,
                        })),
                    },
                    { status: 400 }
                )
            );
        }

        return setCORSHeaders(
            NextResponse.json(
                { error: "Failed to update product" },
                { status: 500 }
            )
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    try {
        // Find product to get image paths
        const product = await prisma.product.findUnique({ where: { id } });
        if (product && Array.isArray(product.images)) {
            const fs = await import("fs/promises");
            for (const imgPath of product.images) {
                if (
                    typeof imgPath === "string" &&
                    imgPath.startsWith(URL_PATHS.PRODUCT_IMAGES)
                ) {
                    const absPath = urlToAssetPath(imgPath);
                    try {
                        await fs.unlink(absPath);
                    } catch {
                        console.warn(`Failed to delete image file: ${absPath}`);
                    }
                }
            }
        }
        await prisma.product.delete({
            where: { id },
        });
        return setCORSHeaders(
            NextResponse.json({ message: "Product deleted successfully" })
        );
    } catch (error) {
        console.error("Failed to delete product:", error);
        return setCORSHeaders(
            NextResponse.json(
                { error: "Failed to delete product" },
                { status: 500 }
            )
        );
    }
}
