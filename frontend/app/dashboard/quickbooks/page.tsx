"use client";

import { useMemo, useState, type ReactNode } from "react";
import QuickBooksConnect from "@/components/QuickBooksConnect";
import SpreadsheetUploadCard from "@/components/SpreadsheetUploadCard";
import type { Bill, Invoice, Payment } from "@/lib/api";
import {
  useBills,
  useInvoices,
  usePayments,
  usePLSummary,
  useQBStatus
} from "@/lib/hooks/useQBData";

type TabKey = "invoices" | "payments" | "bills";

export default function QuickBooksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("invoices");
  const [search, setSearch] = useState("");
  const [invoiceSort, setInvoiceSort] = useState<{ key: keyof Invoice; direction: "asc" | "desc" }>({
    key: "due_date",
    direction: "desc"
  });
  const [paymentSort, setPaymentSort] = useState<{ key: keyof Payment; direction: "asc" | "desc" }>({
    key: "payment_date",
    direction: "desc"
  });
  const [billSort, setBillSort] = useState<{ key: keyof Bill; direction: "asc" | "desc" }>({
    key: "due_date",
    direction: "desc"
  });

  const { data: qbStatus, isLoading: isStatusLoading, error: statusError } = useQBStatus();
  const connected = Boolean(qbStatus?.connected);
  const { data: plSummary, isLoading: isSummaryLoading } = usePLSummary({ enabled: connected });
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices({
    enabled: connected
  });
  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = usePayments({
    enabled: connected
  });
  const { data: bills, isLoading: billsLoading, error: billsError } = useBills({ enabled: connected });

  const sortedInvoices = useMemo(
    () => sortAndFilter(invoices ?? [], search, invoiceSort.key, invoiceSort.direction),
    [invoices, search, invoiceSort]
  );
  const sortedPayments = useMemo(
    () => sortAndFilter(payments ?? [], search, paymentSort.key, paymentSort.direction),
    [payments, search, paymentSort]
  );
  const sortedBills = useMemo(
    () => sortAndFilter(bills ?? [], search, billSort.key, billSort.direction),
    [bills, search, billSort]
  );

  return (
    <section className="space-y-8">
      <div>
        <h1 className="letter-spacing-tight text-2xl font-extrabold text-primary sm:text-3xl">
          QuickBooks Integration
        </h1>
        <p className="text-on-surface-variant">
          Connect your QuickBooks Online account and review transactions.
        </p>
      </div>

      <QuickBooksConnect />
      <SpreadsheetUploadCard />

      {statusError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {statusError}
        </div>
      )}

      {!isStatusLoading && !connected && (
        <div className="editorial-shadow rounded-2xl border border-outline bg-surface p-8 text-center">
          <h2 className="text-xl font-extrabold text-primary">Unlock your financial insights</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-on-surface-variant">
            Connect QuickBooks to see invoices, payments, bills, and real-time profit and loss
            metrics in one place. This helps members monitor cash flow and stay audit-ready.
          </p>
        </div>
      )}

      {connected && (
        <>
          <section className="space-y-4">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
              Summary
            </h2>
            {isSummaryLoading ? (
              <SummarySkeleton />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Total Revenue" value={plSummary?.total_income ?? 0} />
                <MetricCard label="Total Expenses" value={plSummary?.total_expenses ?? 0} />
                <MetricCard
                  label="Net Income"
                  value={plSummary?.net_income ?? 0}
                  highlight={plSummary && plSummary.net_income < 0 ? "negative" : "positive"}
                />
              </div>
            )}
          </section>

          <section className="editorial-shadow rounded-2xl border border-outline bg-surface p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex rounded-lg border border-outline bg-background p-1">
                {(["invoices", "payments", "bills"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                      activeTab === tab
                        ? "bg-secondary/20 text-primary"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-primary placeholder:text-on-surface-variant/60 focus:border-secondary focus:outline-none sm:max-w-xs"
              />
            </div>

            {activeTab === "invoices" && (
              <DataTableSection
                loading={invoicesLoading}
                error={invoicesError}
                emptyMessage="No invoices match your current filters."
                columns={[
                  { key: "doc_number", label: "Invoice #" },
                  { key: "customer_name", label: "Customer" },
                  { key: "total_amount", label: "Amount", numeric: true },
                  { key: "balance", label: "Balance Due", numeric: true },
                  { key: "due_date", label: "Due Date" },
                  { key: "status", label: "Status" }
                ]}
                sortState={invoiceSort}
                onSort={(key) =>
                  setInvoiceSort((prev) => ({
                    key,
                    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
                  }))
                }
                rows={sortedInvoices}
                renderMobileCard={(row) => (
                  <MobileDataCard
                    title={row.doc_number ?? "Invoice"}
                    fields={[
                      { label: "Customer", value: row.customer_name ?? "-" },
                      { label: "Amount", value: formatCurrency(row.total_amount) },
                      { label: "Balance Due", value: formatCurrency(row.balance) },
                      { label: "Due Date", value: row.due_date ?? "-" },
                      { label: "Status", value: row.status }
                    ]}
                  />
                )}
                renderRow={(row) => (
                  <tr key={row.id} className="border-t border-outline text-sm text-on-surface">
                    <td className="px-3 py-2">{row.doc_number ?? "-"}</td>
                    <td className="px-3 py-2">{row.customer_name ?? "-"}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.total_amount)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                    <td className="px-3 py-2">{row.due_date ?? "-"}</td>
                    <td className="px-3 py-2 capitalize">{row.status}</td>
                  </tr>
                )}
              />
            )}

            {activeTab === "payments" && (
              <DataTableSection
                loading={paymentsLoading}
                error={paymentsError}
                emptyMessage="No payments match your current filters."
                columns={[
                  { key: "payment_date", label: "Date" },
                  { key: "customer_name", label: "Customer" },
                  { key: "amount", label: "Amount", numeric: true },
                  { key: "payment_method", label: "Method" }
                ]}
                sortState={paymentSort}
                onSort={(key) =>
                  setPaymentSort((prev) => ({
                    key,
                    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
                  }))
                }
                rows={sortedPayments}
                renderMobileCard={(row) => (
                  <MobileDataCard
                    title={row.customer_name ?? "Payment"}
                    fields={[
                      { label: "Date", value: row.payment_date ?? "-" },
                      { label: "Amount", value: formatCurrency(row.amount) },
                      { label: "Method", value: row.payment_method ?? "-" }
                    ]}
                  />
                )}
                renderRow={(row) => (
                  <tr key={row.id} className="border-t border-outline text-sm text-on-surface">
                    <td className="px-3 py-2">{row.payment_date ?? "-"}</td>
                    <td className="px-3 py-2">{row.customer_name ?? "-"}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.amount)}</td>
                    <td className="px-3 py-2">{row.payment_method ?? "-"}</td>
                  </tr>
                )}
              />
            )}

            {activeTab === "bills" && (
              <DataTableSection
                loading={billsLoading}
                error={billsError}
                emptyMessage="No bills match your current filters."
                columns={[
                  { key: "vendor_name", label: "Vendor" },
                  { key: "total_amount", label: "Amount", numeric: true },
                  { key: "balance", label: "Balance", numeric: true },
                  { key: "due_date", label: "Due Date" },
                  { key: "status", label: "Status" }
                ]}
                sortState={billSort}
                onSort={(key) =>
                  setBillSort((prev) => ({
                    key,
                    direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
                  }))
                }
                rows={sortedBills}
                renderMobileCard={(row) => (
                  <MobileDataCard
                    title={row.vendor_name ?? "Bill"}
                    fields={[
                      { label: "Amount", value: formatCurrency(row.total_amount) },
                      { label: "Balance", value: formatCurrency(row.balance) },
                      { label: "Due Date", value: row.due_date ?? "-" },
                      { label: "Status", value: row.status }
                    ]}
                  />
                )}
                renderRow={(row) => (
                  <tr key={row.id} className="border-t border-outline text-sm text-on-surface">
                    <td className="px-3 py-2">{row.vendor_name ?? "-"}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.total_amount)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                    <td className="px-3 py-2">{row.due_date ?? "-"}</td>
                    <td className="px-3 py-2 capitalize">{row.status}</td>
                  </tr>
                )}
              />
            )}
          </section>
        </>
      )}
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value ?? 0);
}

function sortAndFilter<T extends object>(
  rows: T[],
  query: string,
  sortKey: keyof T,
  direction: "asc" | "desc"
): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? rows.filter((row) =>
        Object.values(row as Record<string, unknown>).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      )
    : rows;

  return [...filtered].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    const aComparable = typeof aValue === "number" ? aValue : String(aValue ?? "").toLowerCase();
    const bComparable = typeof bValue === "number" ? bValue : String(bValue ?? "").toLowerCase();

    if (aComparable < bComparable) return direction === "asc" ? -1 : 1;
    if (aComparable > bComparable) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="editorial-shadow animate-pulse rounded-xl border border-outline bg-surface p-4"
        >
          <div className="h-3 w-24 rounded bg-outline/80" />
          <div className="mt-3 h-7 w-36 rounded bg-outline/80" />
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight
}: {
  label: string;
  value: number;
  highlight?: "positive" | "negative";
}) {
  const valueColor =
    highlight === "positive"
      ? "text-emerald-700"
      : highlight === "negative"
        ? "text-rose-600"
        : "text-primary";

  return (
    <div className="editorial-shadow rounded-xl border border-outline bg-surface p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-extrabold ${valueColor}`}>{formatCurrency(value)}</p>
    </div>
  );
}

function MobileDataCard({
  title,
  fields
}: {
  title: string;
  fields: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-lg border border-outline bg-background p-3 md:hidden">
      <h4 className="text-sm font-bold text-primary">{title}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-y-2 text-xs">
        {fields.map((field) => (
          <div key={`${title}-${field.label}`} className="contents">
            <dt className="text-on-surface-variant">{field.label}</dt>
            <dd className="text-right font-medium text-on-surface">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DataTableSection<T>({
  loading,
  error,
  emptyMessage,
  columns,
  sortState,
  onSort,
  rows,
  renderMobileCard,
  renderRow
}: {
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  columns: Array<{ key: keyof T; label: string; numeric?: boolean }>;
  sortState: { key: keyof T; direction: "asc" | "desc" };
  onSort: (key: keyof T) => void;
  rows: T[];
  renderMobileCard: (row: T) => ReactNode;
  renderRow: (row: T) => ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-12 animate-pulse rounded-lg border border-outline bg-background/80"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm font-medium text-rose-600">{error}</p>;
  }

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-outline bg-background/50 p-8 text-center text-sm text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div key={i}>{renderMobileCard(row)}</div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-outline">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant ${
                    column.numeric ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 hover:text-primary"
                    onClick={() => onSort(column.key)}
                  >
                    {column.label}
                    {sortState.key === column.key && (sortState.direction === "asc" ? "↑" : "↓")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows.map((row) => renderRow(row))}</tbody>
        </table>
      </div>
    </div>
  );
}
