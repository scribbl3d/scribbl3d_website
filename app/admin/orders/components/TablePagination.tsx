"use client";

import { Button } from "@/components/ui/button";

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange(page: number): void;
}

export function TablePagination({
    page,
    pageSize,
    total,
    onPageChange,
}: Props) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, total)} of {total}
            </p>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
