export const WaveLoader = () => (
  <div className="flex items-center justify-center space-x-2">
    <span className="sr-only">Loading...</span>
    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></div>
    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
    <div className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></div>
  </div>
);

export const SkeletonLoader = () => (
  <div className="mx-auto w-full max-w-sm rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex animate-pulse space-x-4">
      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 rounded bg-gray-200"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-2 rounded bg-gray-200"></div>
            <div className="col-span-1 h-2 rounded bg-gray-200"></div>
          </div>
          <div className="h-2 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SpinnerLoader = ({ text }: { text?: string }) => (
  <div className="flex items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-3 border-gray-200 border-t-green-500" />
    {text && <span className="ml-2">{text}</span>}
  </div>
);
