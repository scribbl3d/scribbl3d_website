"use client";

import { useRouter } from "next/navigation";
import type { ProductFormData } from "../PrebuiltProductForm";
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
            onSuccess={() => router.push("/ops/control/prebuilt-products")}
        />
    );
}
