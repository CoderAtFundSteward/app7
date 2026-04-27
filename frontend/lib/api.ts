"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface MemberProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  created_at: string;
}

export interface QBStatus {
  connected: boolean;
  company_name: string | null;
  last_synced_at: string | null;
}

export interface Invoice {
  id: string;
  doc_number: string | null;
  customer_name: string | null;
  total_amount: number;
  balance: number;
  due_date: string | null;
  status: string;
  created_at: string | null;
}

export interface Payment {
  id: string;
  customer_name: string | null;
  amount: number;
  payment_date: string | null;
  payment_method: string | null;
}

export interface Bill {
  id: string;
  vendor_name: string | null;
  total_amount: number;
  balance: number;
  due_date: string | null;
  status: string;
}

export interface PLSummary {
  total_income: number;
  total_expenses: number;
  net_income: number;
}

export interface SpreadsheetUploadResult {
  upload_id: string;
  file_name: string;
  file_type: string;
  rows_imported: number;
}

export interface SpreadsheetUploadSummary {
  id: string;
  file_name: string;
  file_type: string;
  row_count: number;
  uploaded_at: string;
}

export interface UpdateMemberProfileRequest {
  full_name: string;
}

export interface QBConnectUrlResponse {
  url: string;
  state: string;
}

// Backward-compatible type used by older table components.
export interface Transaction {
  id: string;
  txn_date: string;
  amount: number;
  currency: string;
  description: string;
  account_name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function getAccessToken(): Promise<string | undefined> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return session?.access_token;
}

async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  expectNoContent = false
): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers ?? {});
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = (await response.json()) as { detail?: string };
      message = body.detail ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }

    if (response.status === 401) {
      if (message.toLowerCase().includes("quickbooks")) {
        throw new ApiError(401, message || "QuickBooks authorization expired. Please reconnect.");
      }
      if (typeof window !== "undefined") {
        const redirectTo = `${window.location.pathname}${window.location.search}`;
        window.location.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      }
      throw new ApiError(401, "Your session expired. Please sign in again.");
    }

    if (response.status === 429) {
      throw new ApiError(429, "Rate limit reached. Please wait a moment and try again.");
    }

    if (response.status >= 500) {
      throw new ApiError(500, "Server error. Please try again shortly.");
    }

    throw new ApiError(response.status, message);
  }

  if (expectNoContent || response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getMemberProfile(): Promise<MemberProfile> {
  return apiClient<MemberProfile>("/api/members/me");
}

export async function updateMemberProfile(
  data: UpdateMemberProfileRequest
): Promise<MemberProfile> {
  return apiClient<MemberProfile>("/api/members/me", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function getQBStatus(): Promise<QBStatus> {
  return apiClient<QBStatus>("/api/members/me/qb-status");
}

export async function getQBConnectUrl(): Promise<string> {
  const response = await apiClient<QBConnectUrlResponse>("/api/qb/connect/url");
  return response.url;
}

export async function disconnectQB(): Promise<void> {
  await apiClient<void>("/api/qb/disconnect", { method: "POST" }, true);
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiClient<Invoice[]>("/api/qb/invoices");
}

export async function getPayments(): Promise<Payment[]> {
  return apiClient<Payment[]>("/api/qb/payments");
}

export async function getBills(): Promise<Bill[]> {
  return apiClient<Bill[]>("/api/qb/bills");
}

export async function getPLSummary(): Promise<PLSummary> {
  return apiClient<PLSummary>("/api/qb/summary");
}

export async function syncQBData(): Promise<void> {
  await apiClient<void>("/api/qb/sync", { method: "POST" }, true);
}

export async function uploadSpreadsheet(file: File): Promise<SpreadsheetUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient<SpreadsheetUploadResult>("/api/members/me/spreadsheet-upload", {
    method: "POST",
    body: formData
  });
}

export async function getSpreadsheetUploads(): Promise<SpreadsheetUploadSummary[]> {
  return apiClient<SpreadsheetUploadSummary[]>("/api/members/me/spreadsheet-uploads");
}

// Backward-compatible helpers with previous naming used by existing components.
export async function getQuickBooksConnectUrl(): Promise<QBConnectUrlResponse> {
  const response = await apiClient<QBConnectUrlResponse>("/api/qb/connect/url");
  return response;
}

export async function getTransactions(): Promise<Transaction[]> {
  const invoices = await getInvoices();
  return invoices.map((invoice) => ({
    id: invoice.id,
    txn_date: invoice.due_date ?? invoice.created_at ?? "",
    amount: invoice.total_amount,
    currency: "USD",
    description: invoice.doc_number ?? "Invoice",
    account_name: invoice.customer_name ?? "Customer"
  }));
}
