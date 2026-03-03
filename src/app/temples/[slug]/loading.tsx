export default function TempleDetailLoading() {
  return (
    <div className="min-h-screen bg-sandstone">
      {/* Hero banner skeleton */}
      <div className="relative h-[420px] bg-gray-300 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 space-y-3 w-full max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex gap-2 items-center">
            <div className="h-4 w-16 bg-white/30 rounded animate-pulse" />
            <div className="h-4 w-2 bg-white/30 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/30 rounded animate-pulse" />
          </div>
          {/* Title */}
          <div className="h-10 w-80 bg-white/30 rounded-lg animate-pulse" />
          <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
          {/* Badges */}
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-20 bg-white/20 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse" />
            <div className="h-6 w-28 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 space-y-8">
            {/* Gallery skeleton */}
            <div className="flex gap-3 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 w-44 shrink-0 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 pb-0">
              <div className="h-9 w-24 bg-gray-200 rounded-t-lg animate-pulse" />
              <div className="h-9 w-20 bg-gray-100 rounded-t-lg animate-pulse" />
            </div>

            {/* Content paragraphs */}
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 bg-gray-200 rounded animate-pulse ${i === 5 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 bg-gray-200 rounded animate-pulse ${i === 4 ? "w-1/2" : "w-full"}`}
                />
              ))}
            </div>
          </div>

          {/* Quick facts panel skeleton */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="border-t border-gray-100" />
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-2" />
            </div>
          </aside>
        </div>

        {/* Nearby temples skeleton */}
        <div className="mt-14">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
