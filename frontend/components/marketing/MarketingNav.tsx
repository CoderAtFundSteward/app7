"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FundStewardLogo from "@/components/marketing/FundStewardLogo";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseSession } from "@/components/SupabaseSessionProvider";

const navLinkClass =
  "text-white/70 hover:text-white font-semibold text-xs uppercase tracking-widest transition-colors";

export default function MarketingNav() {
  const router = useRouter();
  const { session, loading } = useSupabaseSession();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-primary/95 px-6 py-5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="text-secondary">
            <FundStewardLogo className="h-7 w-7" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FundSteward</span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          <Link className={navLinkClass} href="/#problem">
            Product
          </Link>
          <Link className={navLinkClass} href="/#integrations">
            Integrations
          </Link>
          <Link className={navLinkClass} href="/#pricing">
            Pricing
          </Link>
          <Link className={navLinkClass} href="/#contact">
            Contact
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3">
          {!loading && !session && (
            <>
              <Link
                className="rounded-full px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:text-white sm:px-4"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full border border-white/20 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:border-secondary hover:text-secondary sm:px-4 sm:py-2.5"
                href="/signup"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && session && (
            <>
              <Link
                className="text-[10px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:text-white"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="rounded-full border border-white/20 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:border-secondary hover:text-secondary sm:px-4"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}
          <Link
            className="rounded-full bg-secondary px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-accent sm:px-7"
            href="/#contact"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
