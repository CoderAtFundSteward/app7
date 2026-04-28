"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import FundStewardLogo from "@/components/marketing/FundStewardLogo";
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
    <div className="relative min-h-screen">
      {menuOpen && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-primary/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-primary p-5 transition-transform duration-200 lg:static lg:w-auto lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between lg:mb-10">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="text-secondary">
                <FundStewardLogo className="h-7 w-7 shrink-0" />
              </span>
              <span className="text-sm font-bold tracking-tight text-white">FundSteward</span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/70 transition hover:border-white/30 hover:text-white lg:hidden"
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
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-secondary/20 text-secondary"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <Link
              href="/"
              className="mb-3 block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white/80"
            >
              ← Marketing site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:border-secondary/50 hover:text-secondary"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="bg-background">
          <header className="sticky top-0 z-20 border-b border-outline bg-surface/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMenuOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-outline bg-surface px-3 py-1.5 text-sm font-medium text-primary lg:hidden"
              >
                <span className="text-base leading-none">☰</span>
                Menu
              </button>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-primary">{memberName}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white ring-2 ring-secondary/40">
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
