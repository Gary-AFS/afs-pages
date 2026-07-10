import { useData } from "./lib/data";

export default function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-2">
          <p className="text-red-400 font-semibold">Failed to load data</p>
          <p className="text-gray-500 text-sm">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }

  // Data loaded — tabs will be wired in subsequent tasks
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center font-bold text-black text-sm">
          G
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          GAF Performance Dashboard
        </h1>
        {data && (
          <span className="ml-auto text-xs text-gray-500">
            Updated {new Date(data.generated_at).toLocaleString("en-AU")}
          </span>
        )}
      </header>

      <main className="px-6 py-8">
        <p className="text-gray-400 text-sm">
          Dashboard scaffold ready. Tabs and charts coming in next tasks.
        </p>
        {data && (
          <p className="text-gray-600 text-xs mt-2">
            Windows available: {data.windows?.join(", ")}
          </p>
        )}
      </main>
    </div>
  );
}
