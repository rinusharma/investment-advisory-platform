import { useState } from 'react';
import DropZone from '../components/DropZone.jsx';
import FileList from '../components/FileList.jsx';
import { useWorkflow } from '../context/WorkflowContext.jsx';

export default function ClientProfileStage({ onBack, onNext }) {
  const { setStage1Data } = useWorkflow();
  const [files, setFiles] = useState([]);          // File objects staged client-side
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const hasInput = files.length > 0 || notes.trim().length > 0;

  const handleFilesAdded = (newFiles) => {
    // Deduplicate by name + size
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = newFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
    setValidationError('');
    setUploadResult(null);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadResult(null);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    if (validationError) setValidationError('');
  };

  const handleNextStep = async () => {
    if (!hasInput) {
      setValidationError('Please upload at least one file or enter financial notes before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      // Only call the upload endpoint when files are present
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error ?? 'Upload failed');
        }

        setUploadResult(data);
      }

      // Persist Stage 1 data to shared context, then advance
      setStage1Data({ files, notes, uploadResult: uploadResult });
      onNext();
    } catch (err) {
      setValidationError(`Upload error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Stage indicator */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              1
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Stage 1 of 3
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Client Profile Gathering</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload financial documents or enter notes manually. At least one is required.
          </p>
        </div>

        {/* File Upload Card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-4">
          <h2 className="mb-1 text-sm font-semibold text-gray-700">
            Document Upload
            <span className="ml-2 text-xs font-normal text-gray-400">(PDF or TXT)</span>
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            Upload statements, reports, or any supporting financial documents.
          </p>

          <DropZone onFilesAdded={handleFilesAdded} />
          <FileList files={files} onRemove={handleRemoveFile} />

          {uploadResult && (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5">
              <p className="text-xs font-medium text-green-700">
                {uploadResult.files.length} file{uploadResult.files.length !== 1 ? 's' : ''} uploaded successfully.
              </p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs font-medium text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Notes Card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Manual Financial Notes</h2>
          <p className="mb-4 text-xs text-gray-400">
            Describe the client's financial situation, goals, or any relevant context.
          </p>

          <textarea
            id="financial-notes"
            rows={6}
            value={notes}
            onChange={handleNotesChange}
            placeholder="e.g. Client is 42, earns $120k/yr, has $80k in savings, moderate risk tolerance, targeting retirement at 60…"
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <p className="mt-1.5 text-right text-xs text-gray-300">{notes.length} characters</p>
        </section>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-red-600">{validationError}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {hasInput
              ? files.length > 0 && notes.trim()
                ? `${files.length} file${files.length !== 1 ? 's' : ''} + notes ready`
                : files.length > 0
                ? `${files.length} file${files.length !== 1 ? 's' : ''} ready`
                : 'Notes ready'
              : 'No input yet'}
          </p>

          <button
            type="button"
            disabled={!hasInput || isSubmitting}
            onClick={handleNextStep}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
              hasInput && !isSubmitting
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95'
                : 'cursor-not-allowed bg-gray-100 text-gray-300',
            ].join(' ')}
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                Next Step
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
