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
    <div className="editorial-shadow rounded-2xl border border-outline bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-primary">Import Spreadsheet</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Upload CSV or XLSX accounting transactions. The file and imported rows are saved in
            your profile database records.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshUploads}
          className="rounded-lg border border-outline px-3 py-2 text-sm font-semibold text-primary transition hover:border-secondary/50 hover:text-secondary"
        >
          Refresh uploads
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-primary file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white sm:max-w-md"
        />
        <button
          type="button"
          disabled={!file || uploading}
          onClick={handleUpload}
          className="gold-gradient editorial-shadow rounded-lg px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload & Import"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm font-medium text-primary">
          {success}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-outline bg-background p-3">
        <h3 className="text-sm font-bold text-primary">Recent uploads</h3>
        {loadingUploads ? (
          <p className="mt-2 text-sm text-on-surface-variant">Loading...</p>
        ) : uploads.length ? (
          <div className="mt-2 space-y-2 text-sm">
            {uploads.slice(0, 5).map((upload) => (
              <div
                key={upload.id}
                className="flex flex-col gap-1 rounded-lg border border-outline px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-on-surface">{upload.file_name}</span>
                <span className="text-on-surface-variant">
                  {upload.row_count} rows • {new Date(upload.uploaded_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-on-surface-variant">No spreadsheet uploads yet.</p>
        )}
      </div>
    </div>
  );
}
