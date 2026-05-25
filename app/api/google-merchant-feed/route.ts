// PATH: app/api/google-merchant-feed/route.ts
// Public XML feed for Google Merchant Center — scheduled fetch URL

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.scribbl3d.com"
).replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape XML special characters */
function esc(str: string | null | undefined): string {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** Format price as "1234.00 INR" */
function formatPrice(amount: number): string {
    return `${amount.toFixed(2)} INR`;
}

/**
 * Map internal prebuilt-product category → Google product taxonomy.
 * Full list: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
 */
function googleCategory(category: string): string {
    const lower = category.toLowerCase();
    // Return XML-safe strings (& pre-escaped, > kept literal as Google's separator)
    if (lower.includes("keychain") || lower.includes("keyring"))
        return "Apparel &amp; Accessories > Clothing Accessories > Keychains";
    if (lower.includes("figurine") || lower.includes("statue") || lower.includes("collectible"))
        return "Home &amp; Garden > Decor > Figurines";
    if (lower.includes("cosplay") || lower.includes("mask") || lower.includes("helmet") || lower.includes("sword") || lower.includes("weapon"))
        return "Arts &amp; Entertainment > Hobbies &amp; Creative Arts > Collectibles";
    if (lower.includes("utilit") || lower.includes("holder") || lower.includes("organizer") || lower.includes("stand") || lower.includes("mount"))
        return "Office Supplies > Office Equipment > Desk Organizers";
    if (lower.includes("bookmark"))
        return "Office Supplies > General Office Supplies > Bookmarks";
    if (lower.includes("lamp") || lower.includes("light"))
        return "Home &amp; Garden > Lighting > Lamps";
    if (lower.includes("vase") || lower.includes("planter"))
        return "Home &amp; Garden > Decor > Vases";
    if (lower.includes("articulated") || lower.includes("toy"))
        return "Toys &amp; Games > Toys";
    // Safe fallback
    return "Home &amp; Garden > Decor";
}

/** Build a single <item> block */
function item(fields: Record<string, string | undefined>): string {
    let xml = "    <item>\n";
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== "") {
            xml += `      <${key}>${value}</${key}>\n`;
        }
    }
    xml += "    </item>\n";
    return xml;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET() {
    try {
        // Fetch all three product types in parallel
        const [prebuiltProducts, resins, printers] = await Promise.all([
            prisma.prebuiltProducts.findMany({
                where: { inStock: true },
                include: {
                    images: { orderBy: { position: "asc" } },
                    variants: {
                        where: { isActive: true, inStock: true },
                        orderBy: { createdAt: "asc" },
                    },
                },
            }),
            prisma.resin.findMany({
                where: { inStock: true },
                include: {
                    colours: {
                        where: { inStock: true },
                        orderBy: { sortOrder: "asc" },
                        include: {
                            images: { orderBy: { sortOrder: "asc" }, take: 1 },
                        },
                    },
                    weights: {
                        where: { inStock: true },
                        orderBy: { sortOrder: "asc" },
                    },
                },
            }),
            prisma.printer.findMany({
                where: { inStock: true },
                include: {
                    images: { orderBy: { sortOrder: "asc" }, take: 1 },
                },
            }),
        ]);

        let items = "";

        // ── Prebuilt Products ────────────────────────────────────────────
        for (const product of prebuiltProducts) {
            const link = `${BASE_URL}/prebuilt-products/${encodeURIComponent(product.slug || '')}`;
            const mainImage =
                product.images.find((i) => i.isMain)?.url ||
                product.images[0]?.url;
            const additionalImages = product.images
                .filter((i) => i.url !== mainImage)
                .slice(0, 9); // Google allows up to 10 additional

            if (product.variants.length === 0) {
                // Product with no active variants — skip
                continue;
            }

            for (const variant of product.variants) {
                const titleParts = [product.name];
                if (variant.colorName) titleParts.push(variant.colorName);
                if (variant.sizeName) titleParts.push(variant.sizeName);
                const title = titleParts.join(" — ");

                const fields: Record<string, string | undefined> = {
                    "g:id": `prebuilt-${variant.id}`,
                    "g:item_group_id": `prebuilt-${product.id}`,
                    "g:title": esc(title),
                    "g:description": esc(
                        product.shortDescription || product.name,
                    ),
                    "g:link": link,
                    "g:image_link": mainImage,
                    "g:price": formatPrice(variant.price),
                    "g:sale_price":
                        variant.originalPrice > variant.price
                            ? formatPrice(variant.price)
                            : undefined,
                    "g:availability": "in_stock",
                    "g:condition": "new",
                    "g:brand": "Scribbl3D",
                    "g:product_type": esc(product.category),
                    "g:color": variant.colorName
                        ? esc(variant.colorName)
                        : undefined,
                    "g:size": variant.sizeName
                        ? esc(variant.sizeName)
                        : undefined,
                    "g:shipping_weight": product.weight
                        ? `${product.weight} g`
                        : undefined,
                    "g:identifier_exists": "no",
                    "g:google_product_category": googleCategory(product.category),
                };

                // If there's an original price higher than sale price, set price = original
                if (variant.originalPrice > variant.price) {
                    fields["g:price"] = formatPrice(variant.originalPrice);
                }

                // Additional images
                for (const img of additionalImages) {
                    fields[`g:additional_image_link`] = img.url;
                }

                items += item(fields);
            }
        }

        // ── Resins ───────────────────────────────────────────────────────
        for (const resin of resins) {
            const link = `${BASE_URL}/resins/${resin.slug}`;

            // Pick a fallback image: first colour's first image, or cardImageUrl
            const fallbackImage =
                resin.colours[0]?.images[0]?.url || resin.cardImageUrl || "";

            if (resin.weights.length === 0) continue;

            for (const weight of resin.weights) {
                const weightLabel =
                    weight.weightInGrams >= 1000
                        ? `${weight.weightInGrams / 1000}kg`
                        : `${weight.weightInGrams}g`;

                const title = `${resin.name} — ${weightLabel}`;

                const fields: Record<string, string | undefined> = {
                    "g:id": `resin-${weight.id}`,
                    "g:item_group_id": `resin-${resin.id}`,
                    "g:title": esc(title),
                    "g:description": esc(
                        resin.shortDescription || resin.name,
                    ),
                    "g:link": link,
                    "g:image_link": fallbackImage,
                    "g:price": formatPrice(weight.price),
                    "g:sale_price":
                        weight.originalPrice && weight.originalPrice > weight.price
                            ? formatPrice(weight.price)
                            : undefined,
                    "g:availability": "in_stock",
                    "g:condition": "new",
                    "g:brand": esc(resin.brand.trim()),
                    "g:product_type": "3D Printing Resin",
                    "g:shipping_weight": `${weight.weightInGrams} g`,
                    "g:identifier_exists": "no",
                    "g:google_product_category": "Hardware > Tool Accessories > 3D Printer Accessories",
                };

                if (weight.originalPrice && weight.originalPrice > weight.price) {
                    fields["g:price"] = formatPrice(weight.originalPrice);
                }

                items += item(fields);
            }
        }

        // ── Printers ─────────────────────────────────────────────────────
        for (const printer of printers) {
            const link = `${BASE_URL}/printers/${printer.slug}`;
            const imageUrl = printer.images[0]?.url || "";

            // Printer prices are stored in INR (not paise)
            const priceInr = printer.price;
            const originalPriceInr = printer.originalPrice || null;

            const fields: Record<string, string | undefined> = {
                "g:id": `printer-${printer.id}`,
                "g:title": esc(printer.name),
                "g:description": esc(
                    printer.shortDescription ||
                        printer.description ||
                        printer.name,
                ),
                "g:link": link,
                "g:image_link": imageUrl,
                "g:price":
                    originalPriceInr && originalPriceInr > priceInr
                        ? formatPrice(originalPriceInr)
                        : formatPrice(priceInr),
                "g:sale_price":
                    originalPriceInr && originalPriceInr > priceInr
                        ? formatPrice(priceInr)
                        : undefined,
                "g:availability": "in_stock",
                "g:condition": "new",
                "g:brand": esc(printer.brand.trim()),
                "g:product_type": "3D Printer",
                "g:shipping_weight": printer.weight
                    ? `${printer.weight} g`
                    : undefined,
                "g:identifier_exists": "no",
                "g:google_product_category": "Electronics > Print, Copy, Scan &amp; Fax > 3D Printers",
            };

            items += item(fields);
        }

        // ── Assemble XML ─────────────────────────────────────────────────
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Scribbl3D — Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Google Merchant product feed for Scribbl3D</description>
${items}  </channel>
</rss>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        console.error("[GOOGLE_MERCHANT_FEED]", error);
        return NextResponse.json(
            { error: "Failed to generate feed" },
            { status: 500 },
        );
    }
}
