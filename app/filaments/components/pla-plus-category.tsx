import type { FC } from "react";
import CategoryBase from "./category-base";

interface PLAPlusCategoryProps {
  searchTerm: string;
  sortBy: { field: string; order: "asc" | "desc" };
}

const PLAPlusCategory: FC<PLAPlusCategoryProps> = ({ searchTerm, sortBy }) => {
  return (
    <CategoryBase
      searchTerm={searchTerm}
      sortBy={sortBy}
      categoryName="PLA+"
      apiCategory="PLAplus"
    />
  );
};

export default PLAPlusCategory;
