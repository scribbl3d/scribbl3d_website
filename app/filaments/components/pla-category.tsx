import type { FC } from "react";
import CategoryBase from "./category-base";

interface PLACategoryProps {
  searchTerm: string;
  sortBy: { field: string; order: "asc" | "desc" };
}

const PLACategory: FC<PLACategoryProps> = ({ searchTerm, sortBy }) => {
  return (
    <CategoryBase
      searchTerm={searchTerm}
      sortBy={sortBy}
      categoryName="PLA"
      apiCategory="PLA"
    />
  );
};

export default PLACategory;
