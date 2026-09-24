import type { MouseEvent } from "react";

interface CrawlablePaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    // Listing path, e.g. "/filament"; page 1 links to the clean path
    basePath: string;
    className?: string;
}

const itemClass = "px-3 py-1 border rounded text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

// Pagination rendered as real links so crawlers can reach every page, while
// JS users keep in-place page changes through onPageChange.
export default function CrawlablePagination({
    page,
    totalPages,
    onPageChange,
    basePath,
    className = "flex justify-center items-center gap-2",
}: CrawlablePaginationProps) {
    if (totalPages <= 1) return null;

    const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
    const go = (p: number) => (e: MouseEvent<HTMLAnchorElement>) => {
        // Let modified clicks (new tab/window) use the real link
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onPageChange(p);
    };

    return (
        <nav aria-label="Pagination" className={className}>
            {page > 1 ? (
                <a href={href(page - 1)} rel="prev" onClick={go(page - 1)} className={itemClass}>
                    Prev
                </a>
            ) : (
                <span aria-disabled="true" className={`${itemClass} opacity-40 cursor-not-allowed`}>
                    Prev
                </span>
            )}
            {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                    <a
                        key={p}
                        href={href(p)}
                        onClick={go(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`${itemClass} ${p === page ? "bg-black text-white" : ""}`}
                    >
                        {p}
                    </a>
                );
            })}
            {page < totalPages ? (
                <a href={href(page + 1)} rel="next" onClick={go(page + 1)} className={itemClass}>
                    Next
                </a>
            ) : (
                <span aria-disabled="true" className={`${itemClass} opacity-40 cursor-not-allowed`}>
                    Next
                </span>
            )}
        </nav>
    );
}
