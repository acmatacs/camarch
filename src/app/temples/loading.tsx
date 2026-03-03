export default function TemplesLoading() {
  return (
    <div className="min-h-screen bg-sandstone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-72 shrink-0 space-y-5">
            {/* Search box */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
            {/* Filter sections */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1">
            {/* Result count */}
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  {/* Image */}
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                    <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
