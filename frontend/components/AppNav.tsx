"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FundStewardLogo from "@/components/marketing/FundStewardLogo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSupabaseSession();

  if (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return null;
  }

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-primary/95 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-secondary">
            <FundStewardLogo className="h-7 w-7 shrink-0" />
          </span>
          <span className="text-sm font-bold tracking-tight text-white sm:text-base">FundSteward</span>
        </Link>

        <div className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/dashboard"
            className="font-semibold text-white/70 transition hover:text-white"
          >
            Dashboard
          </Link>
          {!loading && !session && (
            <>
              <Link
                href="/login"
                className="rounded-full px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:text-white sm:px-3 sm:text-xs sm:tracking-normal sm:normal-case"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-accent sm:px-4 sm:text-xs sm:tracking-normal sm:normal-case"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && session && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition hover:border-secondary/50 hover:text-secondary sm:text-xs"
            >
              Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
