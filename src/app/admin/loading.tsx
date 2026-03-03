export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page title */}
      <div className="h-8 w-52 bg-gray-200 rounded-lg" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-8 w-12 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex gap-6 px-6 py-4 border-b border-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-24 bg-gray-200 rounded" />
          ))}
        </div>
        {/* Table rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-6 items-center px-6 py-4 border-b border-gray-50 last:border-0">
            <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
            <div className="h-4 w-40 bg-gray-200 rounded flex-1" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="flex gap-2 ml-auto">
              <div className="h-8 w-14 bg-gray-100 rounded-lg" />
              <div className="h-8 w-16 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
