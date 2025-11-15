"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null; // No pagination needed

    return (
        <div className="flex justify-center gap-2 mt-4">
            <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
                <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => onPageChange(i + 1)}
                >
                    {i + 1}
                </Button>
            ))}

            <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
}
