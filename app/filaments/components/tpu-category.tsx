import type { FC } from "react";
import CategoryBase from "./category-base";

interface TPUCategoryProps {
    searchTerm: string;
    sortBy: { field: string; order: "asc" | "desc" };
}

const TPUCategory: FC<TPUCategoryProps> = ({ searchTerm, sortBy }) => {
    return (
        <CategoryBase
            searchTerm={searchTerm}
            sortBy={sortBy}
            categoryName="TPU"
            apiCategory="TPU"
            limit={8}
            showViewAll
            viewAllHref="/filaments/tpu"
        />
    );
};

export default TPUCategory;
