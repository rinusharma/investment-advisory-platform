function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ name }) {
  const isPdf = name.toLowerCase().endsWith('.pdf');
  return (
    <span
      className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
        isPdf ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
      }`}
    >
      {isPdf ? 'PDF' : 'TXT'}
    </span>
  );
}

export default function FileList({ files, onRemove }) {
  if (!files.length) return null;

  return (
    <ul className="mt-3 space-y-2">
      {files.map((file, index) => (
        <li
          key={`${file.name}-${index}`}
          className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-2.5 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon name={file.name} />
            <span className="truncate text-sm font-medium text-gray-700">{file.name}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(index)}
              className="rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
