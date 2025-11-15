import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// Changed to named export to match how it's being imported
export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="bg-[#F8F9FC] px-2 sm:px-3 py-1.5 sm:py-2 rounded-[8px] overflow-x-auto whitespace-nowrap max-w-full">
      <ol className="flex items-center gap-2 sm:gap-4 min-w-min">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2 sm:gap-4">
            <Link
              href={item.href}
              className={`text-xs sm:text-sm font-inter font-normal truncate max-w-[120px] sm:max-w-[200px] hover:underline ${
                index === items.length - 1
                  ? "text-[#1E3A8A] font-semibold"
                  : "text-[#A3A9C2]"
              }`}
              title={item.label}
            >
              {item.label}
            </Link>
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#A3A9C2]" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
