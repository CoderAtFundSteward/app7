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
        <h1 className="letter-spacing-tight text-2xl font-extrabold text-primary sm:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Here is your membership and accounting integration snapshot.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="editorial-shadow rounded-xl border border-outline bg-surface p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
            Membership Status
          </p>
          {memberLoading ? (
            <div className="mt-3 h-7 w-40 animate-pulse rounded bg-outline/60" />
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-secondary/40 bg-secondary/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                {member?.subscription_tier ?? "free"}
              </span>
              <span className="text-sm text-on-surface-variant">Active member account</span>
            </div>
          )}
          <p className="mt-4 text-sm text-on-surface-variant">
            Upgrade your tier to unlock additional reporting and automation workflows.
          </p>
        </article>

        <article className="editorial-shadow rounded-xl border border-outline bg-surface p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
            QuickBooks Status
          </p>
          {qbLoading ? (
            <div className="mt-4 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-outline/60" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-outline/60" />
            </div>
          ) : !connected ? (
            <>
              <p className="mt-3 text-sm text-on-surface">
                Connect QuickBooks to view your accounting data.
              </p>
              <Link
                href="/dashboard/quickbooks"
                className="gold-gradient editorial-shadow mt-4 inline-flex rounded-lg px-5 py-2.5 text-sm font-extrabold uppercase tracking-widest text-primary transition hover:scale-[1.02]"
              >
                Connect QuickBooks
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-on-surface">
                Connected to{" "}
                <span className="font-semibold text-primary">
                  {qbStatus?.company_name ?? "QuickBooks"}
                </span>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Total invoices:{" "}
                <span className="font-semibold text-primary">
                  {invoicesLoading ? "..." : (invoices?.length ?? 0)}
                </span>
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Last sync: <span className="font-semibold text-primary">{lastSynced}</span>
              </p>
              <Link
                href="/dashboard/quickbooks"
                className="mt-4 inline-flex rounded-lg border-2 border-primary px-4 py-2 text-sm font-bold uppercase tracking-widest text-primary transition hover:bg-primary hover:text-white"
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
