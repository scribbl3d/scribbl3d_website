import type { FC } from "react";
import CategoryBase from "./category-base";

interface ABSCategoryProps {
    searchTerm: string;
    sortBy: { field: string; order: "asc" | "desc" };
}

const ABSCategory: FC<ABSCategoryProps> = ({ searchTerm, sortBy }) => {
    return (
        <CategoryBase
            searchTerm={searchTerm}
            sortBy={sortBy}
            categoryName="ABS"
            apiCategory="ABS"
            limit={8}
            showViewAll
            viewAllHref="/filaments/abs"
        />
    );
};

export default ABSCategory;
