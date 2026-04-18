"use client";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 7,
    className = "",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [];
        const leftSiblings = Math.floor((maxVisible - 3) / 2);
        const rightSiblings = Math.ceil((maxVisible - 3) / 2);

        const showLeftEllipsis = currentPage > leftSiblings + 2;
        const showRightEllipsis = currentPage < totalPages - rightSiblings - 1;

        if (!showLeftEllipsis && showRightEllipsis) {
            const leftRange = Array.from(
                { length: maxVisible - 2 },
                (_, i) => i + 1,
            );
            pages.push(...leftRange, "...", totalPages);
        } else if (showLeftEllipsis && !showRightEllipsis) {
            const rightRange = Array.from(
                { length: maxVisible - 2 },
                (_, i) => totalPages - (maxVisible - 3) + i,
            );
            pages.push(1, "...", ...rightRange);
        } else if (showLeftEllipsis && showRightEllipsis) {
            const middleRange = Array.from(
                { length: maxVisible - 4 },
                (_, i) => currentPage - leftSiblings + i,
            );
            pages.push(1, "...", ...middleRange, "...", totalPages);
        } else {
            pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
        }

        return pages;
    };

    return (
        <div
            className={`flex justify-center items-center gap-2 ${className}`}
        >
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition"
            >
                Prev
            </button>

            {getPageNumbers().map((page, index) => {
                if (page === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-400"
                        >
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`px-3 py-1 border border-gray-200 rounded text-sm transition ${
                            page === currentPage
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "hover:bg-gray-50"
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition"
            >
                Next
            </button>
        </div>
    );
}
