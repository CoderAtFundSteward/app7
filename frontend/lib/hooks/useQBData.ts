"use client";

import useSWR from "swr";
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

export function useQBStatus(options: HookOptions = {}): HookResult<QBStatus> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(enabled ? "qb-status" : null, getQBStatus);
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useMemberProfile(options: HookOptions = {}): HookResult<MemberProfile> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "member-profile" : null,
    getMemberProfile
  );
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useInvoices(options: HookOptions = {}): HookResult<Invoice[]> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "qb-invoices" : null,
    getInvoices
  );
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function usePayments(options: HookOptions = {}): HookResult<Payment[]> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "qb-payments" : null,
    getPayments
  );
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function useBills(options: HookOptions = {}): HookResult<Bill[]> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(enabled ? "qb-bills" : null, getBills);
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}

export function usePLSummary(options: HookOptions = {}): HookResult<PLSummary> {
  const { enabled = true } = options;
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "qb-pl-summary" : null,
    getPLSummary
  );
  return {
    data,
    isLoading,
    error: error ? parseError(error) : null,
    mutate: () => mutate()
  };
}
