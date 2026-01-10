"use client";

import ResinCard from "./ResinCard";

type Props = {
    resins: any[];
    page: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
};

export default function ResinGrid({
    resins,
    page,
    total,
    limit,
    onPageChange,
}: Props) {
    const totalPages = Math.ceil(total / limit);

    return (
        <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resins.map((resin) => (
                    <ResinCard key={resin.id} resin={resin} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`px-3 py-1 rounded ${
                                page === i + 1
                                    ? "bg-black text-white"
                                    : "border"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}
