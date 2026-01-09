"use client";

import { useParams } from "next/navigation";
import CategoryBase from "../components/category-base";

const CATEGORY_MAP: Record<string, { name: string; api: string }> = {
    plaplus: { name: "PLA+", api: "PLAplus" },
    abs: { name: "ABS", api: "ABS" },
    petg: { name: "PETG", api: "PETG" },
    tpu: { name: "TPU", api: "TPU" },
    nylon: { name: "Nylon", api: "Nylon" },
};

export default function FilamentCategoryPage() {
    const params = useParams();

    if (!params || !params.category) {
        return <div className="p-8">Category not found</div>;
    }

    const slug = params.category as string;

    const config = CATEGORY_MAP[slug];

    if (!config) {
        return <div className="p-8">Category not found</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <CategoryBase
                searchTerm=""
                sortBy={{ field: "name", order: "asc" }}
                categoryName="PLA+"
                apiCategory="PLAplus"
                isStandalone
            />
        </div>
    );
}
