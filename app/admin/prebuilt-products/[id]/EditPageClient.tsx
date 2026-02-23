// PATH: app/admin/prebuilt-products/[id]/EditPageClient.tsx

"use client";

import type { ProductFormData } from "../PrebuiltProductForm";

import { useRouter } from "next/navigation";
import PrebuiltProductForm from "../PrebuiltProductForm";

type Props = {
    productId: string;
    defaultValues: Partial<ProductFormData & { id: string }>;
};

export default function EditPageClient({ productId, defaultValues }: Props) {
    const router = useRouter();

    return (
        <PrebuiltProductForm
            mode="edit"
            productId={productId}
            defaultValues={defaultValues}
            onSuccess={() => router.push("/admin/prebuilt-products")}
        />
    );
}
