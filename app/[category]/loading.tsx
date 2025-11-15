export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 mt-[70px]">
      <div className="space-y-4 sm:space-y-6">
        {/* Back button skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />

        {/* Breadcrumb skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />

        {/* Title and count skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-1 bg-gray-300"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="w-full max-w-sm bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-200 animate-pulse" />

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />

                {/* Price skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Button skeleton */}
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
