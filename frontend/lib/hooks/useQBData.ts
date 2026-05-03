"use client";

import useSWR from "swr";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";
import {
  getMemberProfile,
  getBills,
  getInvoices,
  getPayments,
  getPLSummary,
  getQBStatus,
  type MemberProfile,
  type Bill,
  type Invoice,
  type Payment,
  type PLSummary,
  type QBStatus
} from "@/lib/api";

type HookResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
  mutate: () => Promise<T | undefined>;
};

function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

type HookOptions = {
  enabled?: boolean;
};

/** Wait for Supabase session in the browser before hitting the API (avoids 401 + login redirect flash). */
function useReadyFetch(enabled: boolean) {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const sessionReady = Boolean(session) && !sessionLoading;
  const shouldFetch = enabled && sessionReady;
  return { shouldFetch, sessionLoading };
}

export function useQBStatus(options: HookOptions = {}): HookResult<QBStatus> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(shouldFetch ? "qb-status" : null, getQBStatus);
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useMemberProfile(options: HookOptions = {}): HookResult<MemberProfile> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "member-profile" : null,
    getMemberProfile
  );
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useInvoices(options: HookOptions = {}): HookResult<Invoice[]> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "qb-invoices" : null,
    getInvoices
  );
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function usePayments(options: HookOptions = {}): HookResult<Payment[]> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "qb-payments" : null,
    getPayments
  );
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useBills(options: HookOptions = {}): HookResult<Bill[]> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(shouldFetch ? "qb-bills" : null, getBills);
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function usePLSummary(options: HookOptions = {}): HookResult<PLSummary> {
  const { enabled = true } = options;
  const { shouldFetch, sessionLoading } = useReadyFetch(enabled);
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "qb-pl-summary" : null,
    getPLSummary
  );
  return {
    data,
    isLoading: sessionLoading || (shouldFetch && isLoading),
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}
