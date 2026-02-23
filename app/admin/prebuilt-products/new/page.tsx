// PATH: app/admin/prebuilt-products/new/page.tsx

"use client";

import { useRouter } from "next/navigation";
import PrebuiltProductForm from "../PrebuiltProductForm";

export default function NewPrebuiltProductPage() {
    const router = useRouter();

    return (
        <PrebuiltProductForm
            mode="create"
            onSuccess={() => router.push("/admin/prebuilt-products")}
        />
    );
}
