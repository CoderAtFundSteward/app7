"use client";

import { useMemo, useState } from "react";
import {
  getSpreadsheetUploads,
  type SpreadsheetUploadSummary,
  uploadSpreadsheet
} from "@/lib/api";

export default function SpreadsheetUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploads, setUploads] = useState<SpreadsheetUploadSummary[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  const acceptedTypes = useMemo(() => ".csv,.xlsx", []);

  async function refreshUploads() {
    setLoadingUploads(true);
    try {
      const data = await getSpreadsheetUploads();
      setUploads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUploads(false);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await uploadSpreadsheet(file);
      setSuccess(`Imported ${result.rows_imported} rows from ${result.file_name}.`);
      setFile(null);
      await refreshUploads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Import Spreadsheet</h2>
          <p className="mt-1 text-sm text-slate-400">
            Upload CSV or XLSX accounting transactions. The file and imported rows are saved in
            your profile database records.
          </p>
        </div>
        <button
          onClick={refreshUploads}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
        >
          Refresh uploads
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-slate-100 sm:max-w-md"
        />
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload & Import"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
        <h3 className="text-sm font-medium text-slate-200">Recent uploads</h3>
        {loadingUploads ? (
          <p className="mt-2 text-sm text-slate-400">Loading...</p>
        ) : uploads.length ? (
          <div className="mt-2 space-y-2 text-sm">
            {uploads.slice(0, 5).map((upload) => (
              <div
                key={upload.id}
                className="flex flex-col gap-1 rounded border border-slate-800 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-slate-200">{upload.file_name}</span>
                <span className="text-slate-400">
                  {upload.row_count} rows • {new Date(upload.uploaded_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">No spreadsheet uploads yet.</p>
        )}
      </div>
    </div>
  );
}
