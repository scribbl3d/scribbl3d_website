import type { FC } from "react";
import CategoryBase from "./category-base";

interface PETGCategoryProps {
    searchTerm: string;
    sortBy: { field: string; order: "asc" | "desc" };
}

const PETGCategory: FC<PETGCategoryProps> = ({ searchTerm, sortBy }) => {
    return (
        <CategoryBase
            searchTerm={searchTerm}
            sortBy={sortBy}
            categoryName="PETG"
            apiCategory="PETG"
            limit={8}
            showViewAll
            viewAllHref="/filaments/petg"
            disableWishlist
        />
    );
};

export default PETGCategory;
