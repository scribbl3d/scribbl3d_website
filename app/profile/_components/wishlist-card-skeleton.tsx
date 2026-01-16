"use client";

export default function WishlistCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-pulse">
            {/* IMAGE */}
            <div className="h-[240px] bg-gray-200" />

            {/* CONTENT */}
            <div className="p-4 flex flex-col gap-3">
                {/* BADGE */}
                <div className="h-5 w-20 bg-gray-200 rounded-full" />

                {/* TITLE */}
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />

                {/* DIVIDER */}
                <div className="h-px bg-gray-200 my-2" />

                {/* PRICE */}
                <div className="flex gap-2 items-center">
                    <div className="h-5 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>

                {/* BUTTON */}
                <div className="h-[44px] w-full bg-gray-200 rounded-md mt-2" />
            </div>
        </div>
    );
}
