"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FundStewardLogo from "@/components/marketing/FundStewardLogo";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function shouldHideAppNav(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/auth/")) return true;
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/update-password"
  );
}

const navLinkClass = "text-sm font-semibold text-white/70 transition-colors hover:text-white";

export default function AppNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading } = useSupabaseSession();

  if (shouldHideAppNav(pathname)) {
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
      <nav
        className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
        aria-label="App"
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="text-secondary">
            <FundStewardLogo className="h-7 w-7 shrink-0" />
          </span>
          <span className="text-sm font-bold tracking-tight text-white sm:text-base">FundSteward</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <Link href="/dashboard" className={navLinkClass}>
            Dashboard
          </Link>
          {!loading && !session ? (
            <>
              <Link href="/login" className={navLinkClass}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-accent sm:px-4 sm:text-xs sm:tracking-normal sm:normal-case"
              >
                Sign up
              </Link>
            </>
          ) : null}
          {!loading && session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:border-secondary/50 hover:text-secondary sm:text-xs"
            >
              Log out
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
