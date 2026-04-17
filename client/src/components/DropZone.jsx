import { useRef, useState } from 'react';

const ALLOWED_TYPES = ['application/pdf', 'text/plain'];
const ALLOWED_EXTS = ['.pdf', '.txt'];

function isAllowed(file) {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext);
}

export default function DropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const valid = Array.from(e.dataTransfer.files).filter(isAllowed);
    if (valid.length) onFilesAdded(valid);
  };

  const handleChange = (e) => {
    const valid = Array.from(e.target.files).filter(isAllowed);
    if (valid.length) onFilesAdded(valid);
    // reset so the same file can be re-added after removal
    e.target.value = '';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files by clicking or dragging"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      className={[
        'flex flex-col items-center justify-center gap-3',
        'rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer',
        'transition-colors duration-150 select-none',
        isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        multiple
        hidden
        onChange={handleChange}
      />

      {/* Upload icon */}
      <div className={`rounded-full p-3 ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-7 w-7 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className={`text-sm font-medium ${isDragging ? 'text-indigo-700' : 'text-gray-600'}`}>
          {isDragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-400">PDF and TXT files only · Max 10 MB each</p>
      </div>
    </div>
  );
}
