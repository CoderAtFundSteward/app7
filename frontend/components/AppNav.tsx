"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSupabaseSession();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-wide text-emerald-300">
          FundSteward
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-slate-300 transition hover:text-white">
            Dashboard
          </Link>
          {!loading && !session && (
            <>
              <Link href="/login" className="text-slate-300 transition hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && session && (
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
