import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    console.log("🔥 BUY NOW ROUTE HIT");

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const productId = searchParams.get("productId");

    if (!type || !productId) {
        return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    let item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        images: string[];
    } | null = null;

    if (type === "product") {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product)
            return Response.json({ error: "Not found" }, { status: 404 });

        item = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            images: product.images ?? [],
        };
    } else if (type === "prebuiltproduct") {
        const prebuilt = await prisma.prebuiltProduct.findUnique({
            where: { id: productId },
        });
        if (!prebuilt)
            return Response.json({ error: "Not found" }, { status: 404 });

        item = {
            id: prebuilt.id,
            name: prebuilt.name,
            price: prebuilt.price,
            quantity: 1,
            images: prebuilt.images ?? [],
        };
    } else if (type === "printer") {
        const printer = await prisma.printer.findUnique({
            where: { id: productId },
        });
        if (!printer)
            return Response.json({ error: "Not found" }, { status: 404 });

        item = {
            id: printer.id,
            name: printer.name,
            price: printer.price,
            quantity: 1,
            images: [],
        };
    } else {
        return Response.json({ error: "Invalid type" }, { status: 400 });
    }

    return Response.json(item);
}
