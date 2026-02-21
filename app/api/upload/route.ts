import cloudinary from "@/lib/cloudinary";

const ALLOWED_FOLDERS = [
    "hero-images",
    "landingpage",
    "services",
    "blog-images",
    "product-images",
    "printer-images",
    "printer_images",
    "filaments/product_images",
];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = formData.get("folder") as string | null;

        if (!file || !folder) {
            return Response.json(
                { error: "File or folder missing" },
                { status: 400 }
            );
        }

        if (!ALLOWED_FOLDERS.includes(folder)) {
            return Response.json(
                { error: "Invalid upload folder" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const result: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder,
                        resource_type: "image",
                    },
                    (err, res) => {
                        if (err) reject(err);
                        else resolve(res);
                    }
                )
                .end(buffer);
        });

        return Response.json({
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (err) {
        console.error("Upload error:", err);
        return Response.json({ error: "Upload failed" }, { status: 500 });
    }
}
