"use client";

import { useEffect, useMemo, useState } from "react";
import {
  disconnectQB,
  getQBConnectUrl,
  getQBSetupStatus,
  qbConnectFailureMessage,
  syncQBData,
  type QBSetupStatus
} from "@/lib/api";
import { useQBStatus } from "@/lib/hooks/useQBData";

export default function QuickBooksConnect() {
  const { data: qbStatus, isLoading, error: statusError, mutate } = useQBStatus();
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [intuitVerify, setIntuitVerify] = useState<QBSetupStatus | null>(null);
  const [intuitVerifyLoading, setIntuitVerifyLoading] = useState(false);
  const [intuitVerifyError, setIntuitVerifyError] = useState<string | null>(null);

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
      setActionError(qbConnectFailureMessage(err));
      console.error("QuickBooks connect failed", err);
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
      const message =
        err instanceof Error ? err.message : "Sync failed. Please try again in a moment.";
      if (message.toLowerCase().includes("quickbooks")) {
        setActionError("QuickBooks authorization expired. Please reconnect your account.");
      } else {
        setActionError("Sync failed. Please try again in a moment.");
      }
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleVerifyIntuit = async () => {
    setIntuitVerifyError(null);
    setIntuitVerifyLoading(true);
    try {
      const s = await getQBSetupStatus();
      setIntuitVerify(s);
    } catch (err) {
      setIntuitVerify(null);
      setIntuitVerifyError(err instanceof Error ? err.message : "Could not load setup status.");
      console.error(err);
    } finally {
      setIntuitVerifyLoading(false);
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
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-3 text-sm editorial-shadow ${
            toast.type === "success"
              ? "border-secondary/40 bg-secondary/15 text-primary"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="editorial-shadow rounded-2xl border border-outline bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-primary">QuickBooks Online</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Connect your account to sync invoices, payments, and bills.
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-outline bg-background px-3 py-1 text-xs font-semibold text-on-surface-variant">
            Powered by Intuit
          </span>
        </div>

        {(statusError || actionError) && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <p>{actionError ?? statusError}</p>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                void mutate();
              }}
              className="mt-2 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-outline pt-4">
          <button
            type="button"
            onClick={() => void handleVerifyIntuit()}
            disabled={intuitVerifyLoading}
            className="rounded-lg border border-outline px-3 py-2 text-xs font-semibold text-on-surface-variant transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {intuitVerifyLoading ? "Loading…" : "Verify Intuit ↔ server settings"}
          </button>
          {intuitVerifyError && <p className="mt-2 text-xs text-rose-700">{intuitVerifyError}</p>}
          {intuitVerify && (
            <div className="mt-3 space-y-3 rounded-lg border border-outline bg-background p-4 text-xs text-primary">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="font-extrabold text-on-surface-variant">OAuth credentials on server</p>
                  <p className="mt-1">
                    {intuitVerify.oauth_client_configured ? (
                      <span className="text-emerald-700">Client ID + secret present</span>
                    ) : (
                      <span className="text-rose-700">Missing QB_CLIENT_ID or QB_CLIENT_SECRET</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface-variant">Client ID (masked)</p>
                  <p className="mt-1 font-mono">{intuitVerify.client_id_masked}</p>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface-variant">QB_ENVIRONMENT</p>
                  <p className="mt-1">{intuitVerify.qb_environment}</p>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface-variant">Redirect URI (must match Intuit app)</p>
                  <p className="mt-1 break-all font-mono text-[11px]">{intuitVerify.redirect_uri}</p>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface-variant">OAuth authorize URL</p>
                  <p className="mt-1 break-all font-mono text-[11px]">{intuitVerify.oauth_authorize_host}</p>
                </div>
                <div>
                  <p className="font-extrabold text-on-surface-variant">Scope</p>
                  <p className="mt-1 break-all font-mono text-[11px]">{intuitVerify.expected_scope}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-extrabold text-on-surface-variant">FRONTEND_URL (first origin for redirects)</p>
                  <p className="mt-1 break-all font-mono text-[11px]">{intuitVerify.frontend_base_url}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 font-extrabold text-on-surface-variant">Compare in Intuit Developer Portal</p>
                <ol className="list-decimal space-y-2 pl-4 text-on-surface-variant">
                  {intuitVerify.intuit_portal_checks.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mt-5 flex items-center gap-3 text-sm text-on-surface-variant">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-outline border-t-secondary" />
            Checking QuickBooks connection...
          </div>
        ) : !qbStatus?.connected ? (
          <div className="mt-5">
            <button
              type="button"
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
            <div className="grid gap-3 rounded-lg border border-outline bg-background p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                  Company
                </p>
                <p className="mt-1 font-semibold text-primary">{qbStatus.company_name ?? "Connected"}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                  Last synced
                </p>
                <p className="mt-1 font-semibold text-primary">{formattedLastSync}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="gold-gradient editorial-shadow inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-extrabold uppercase tracking-widest text-primary transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {syncing && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                )}
                {syncing ? "Syncing..." : "Sync Now"}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-70"
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
