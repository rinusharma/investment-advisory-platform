export default function ServerStatusCard({ loading, data, error }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">API Health Check</h2>

      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">Checking server status…</p>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-600">Connection error</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
        </div>
      )}

      {data && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-semibold text-green-700">{data.message}</p>
          </div>
          <p className="text-xs text-gray-400">
            Status: <span className="font-medium text-gray-600">{data.status}</span>
          </p>
          <p className="text-xs text-gray-400">
            Timestamp: <span className="font-medium text-gray-600">{data.timestamp}</span>
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-300">Endpoint: GET /api/health</p>
    </div>
  );
}
