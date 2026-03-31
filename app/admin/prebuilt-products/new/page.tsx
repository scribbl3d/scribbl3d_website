"use client";

import { useRouter } from "next/navigation";
import PrebuiltProductForm from "../PrebuiltProductForm";

export default function NewPrebuiltProductPage() {
    const router = useRouter();

    return (
        <PrebuiltProductForm
            mode="create"
            onSuccess={() => router.push("/ops/control/prebuilt-products")}
        />
    );
}
