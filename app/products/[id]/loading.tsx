import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="max-w-[1440px] w-full pb-8 mt-[150px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-[650px] w-full rounded-lg" />
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-24 h-24 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-1/3" />
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
