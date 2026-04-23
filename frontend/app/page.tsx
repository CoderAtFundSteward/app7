import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Membership Portal</h1>
      <p className="text-slate-600">
        Members can access their dashboard and optionally connect QuickBooks
        Online to view accounting transactions.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Get started
        </Link>
        <Link
          href="/dashboard"
          className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
        >
          Open dashboard
        </Link>
      </div>
    </section>
  );
}
