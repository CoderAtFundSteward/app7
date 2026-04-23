"use client";

import { useEffect, useMemo, useState } from "react";
import { disconnectQB, getQBConnectUrl, syncQBData } from "@/lib/api";
import { useQBStatus } from "@/lib/hooks/useQBData";

export default function QuickBooksConnect() {
  const { data: qbStatus, isLoading, error: statusError, mutate } = useQBStatus();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected === "true") {
      setToast({
        type: "success",
        message: "QuickBooks connected successfully."
      });
      void mutate();
    } else if (error === "true") {
      setToast({
        type: "error",
        message: "We couldn't connect your QuickBooks account. Please try again."
      });
    }

    if (connected || error) {
      params.delete("connected");
      params.delete("error");
      const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", next);
    }
  }, [mutate]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const formattedLastSync = useMemo(() => {
    if (!qbStatus?.last_synced_at) return "Never synced";
    const date = new Date(qbStatus.last_synced_at);
    if (Number.isNaN(date.getTime())) return "Never synced";
    return date.toLocaleString();
  }, [qbStatus?.last_synced_at]);

  const handleConnect = async () => {
    setConnecting(true);
    setActionError(null);
    try {
      const oauthUrl = await getQBConnectUrl();
      window.location.href = oauthUrl;
    } catch (err) {
      setActionError("Unable to start QuickBooks connection right now. Please retry.");
      console.error(err);
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setActionError(null);
    try {
      await syncQBData();
      await mutate();
      setToast({ type: "success", message: "QuickBooks data synced." });
    } catch (err) {
      setActionError("Sync failed. Please try again in a moment.");
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setActionError(null);
    try {
      await disconnectQB();
      await mutate();
      setToast({ type: "success", message: "QuickBooks disconnected." });
    } catch (err) {
      setActionError("Disconnect failed. Please try again.");
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/15 text-rose-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-emerald-950/10 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">QuickBooks Online</h2>
            <p className="mt-1 text-sm text-slate-400">
              Connect your account to sync invoices, payments, and bills.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
            Powered by Intuit
          </span>
        </div>

        {(statusError || actionError) && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            <p>{actionError ?? statusError}</p>
            <button
              onClick={() => {
                setActionError(null);
                void mutate();
              }}
              className="mt-2 rounded-md border border-rose-400/40 px-3 py-1.5 text-xs font-medium hover:bg-rose-500/10"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-emerald-400" />
            Checking QuickBooks connection...
          </div>
        ) : !qbStatus?.connected ? (
          <div className="mt-5">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              style={{ backgroundColor: "#2CA01C" }}
            >
              {connecting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                  Connecting...
                </>
              ) : (
                <>
                  <span className="inline-flex h-5 items-center rounded bg-white px-1.5 text-[11px] font-bold text-[#0077C5]">
                    intuit
                  </span>
                  Connect QuickBooks
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Company</p>
                <p className="mt-1 font-medium text-slate-100">{qbStatus.company_name ?? "Connected"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Last synced</p>
                <p className="mt-1 font-medium text-slate-100">{formattedLastSync}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {syncing && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300/70 border-t-emerald-100" />
                )}
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
