import { Skeleton } from "@/components/ui/skeleton";

export const ProductSkeleton = () => (
    <div className="w-full">
        <div className="w-[300px] h-[470px] bg-white rounded-lg overflow-hidden mx-auto">
            <Skeleton className="w-full h-[340px]" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
);
