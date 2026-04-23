"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "QuickBooks", href: "/dashboard/quickbooks" },
  { label: "Settings", href: "/dashboard/settings" }
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { session } = useSupabaseSession();

  const memberName = useMemo(() => {
    const fullName = session?.user.user_metadata?.full_name as string | undefined;
    if (fullName?.trim()) return fullName;
    const email = session?.user.email ?? "";
    return email ? email.split("@")[0] : "Member";
  }, [session]);

  const avatarLabel = memberName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative -mx-4 min-h-[calc(100vh-4rem)] sm:-mx-6">
      {menuOpen && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[260px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-950 p-5 transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between lg:mb-10">
            <Link href="/dashboard" className="text-sm font-semibold tracking-wide text-emerald-300">
              FundSteward
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 lg:hidden"
            >
              Close
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-800 pt-5">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="bg-slate-100">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 lg:hidden"
              >
                <span className="text-base leading-none">☰</span>
                Menu
              </button>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-medium text-slate-800">{memberName}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {avatarLabel}
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6">{children}</div>
        </section>
      </div>
    </div>
  );
}
