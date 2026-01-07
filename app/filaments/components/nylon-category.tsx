import type { FC } from "react";
import CategoryBase from "./category-base";

interface NylonCategoryProps {
    searchTerm: string;
    sortBy: { field: string; order: "asc" | "desc" };
}

const NylonCategory: FC<NylonCategoryProps> = ({ searchTerm, sortBy }) => {
    return (
        <CategoryBase
            searchTerm={searchTerm}
            sortBy={sortBy}
            categoryName="Nylon"
            apiCategory="NYLON"
        />
    );
};

export default NylonCategory;
