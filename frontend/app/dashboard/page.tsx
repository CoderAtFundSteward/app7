"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useInvoices, useMemberProfile, useQBStatus } from "@/lib/hooks/useQBData";

export default function DashboardPage() {
  const { data: member, isLoading: memberLoading } = useMemberProfile();
  const { data: qbStatus, isLoading: qbLoading } = useQBStatus();
  const connected = Boolean(qbStatus?.connected);
  const { data: invoices, isLoading: invoicesLoading } = useInvoices({ enabled: connected });

  const displayName = useMemo(() => {
    if (member?.full_name?.trim()) return member.full_name;
    if (member?.email) return member.email.split("@")[0];
    return "Member";
  }, [member]);

  const lastSynced = useMemo(() => {
    if (!qbStatus?.last_synced_at) return "Not synced yet";
    const date = new Date(qbStatus.last_synced_at);
    return Number.isNaN(date.getTime()) ? "Not synced yet" : date.toLocaleString();
  }, [qbStatus?.last_synced_at]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {displayName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Here is your membership and accounting integration snapshot.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Membership Status
          </p>
          {memberLoading ? (
            <div className="mt-3 h-7 w-40 animate-pulse rounded bg-slate-200" />
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                {member?.subscription_tier ?? "free"}
              </span>
              <span className="text-sm text-slate-500">Active member account</span>
            </div>
          )}
          <p className="mt-4 text-sm text-slate-600">
            Upgrade your tier to unlock additional reporting and automation workflows.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            QuickBooks Status
          </p>
          {qbLoading ? (
            <div className="mt-4 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          ) : !connected ? (
            <>
              <p className="mt-3 text-sm text-slate-700">
                Connect QuickBooks to view your accounting data.
              </p>
              <Link
                href="/dashboard/quickbooks"
                className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Connect QuickBooks
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-700">
                Connected to <span className="font-semibold">{qbStatus?.company_name ?? "QuickBooks"}</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Total invoices:{" "}
                <span className="font-medium text-slate-900">
                  {invoicesLoading ? "..." : (invoices?.length ?? 0)}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Last sync: <span className="font-medium text-slate-900">{lastSynced}</span>
              </p>
              <Link
                href="/dashboard/quickbooks"
                className="mt-4 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Open QuickBooks Dashboard
              </Link>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
