import Link from "next/link";
import FundStewardLogo from "@/components/marketing/FundStewardLogo";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-primary px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="text-secondary">
                <FundStewardLogo className="h-6 w-6 shrink-0" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">FundSteward</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/40">
              Headquartered in Atlanta, GA.
              <br />
              Empowering stewards of capital since 2026.
            </p>
          </div>
          <div>
            <h5 className="mb-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
              Platform
            </h5>
            <ul className="space-y-5 text-sm font-medium text-white/50">
              <li>
                <Link className="transition-colors hover:text-secondary" href="/#problem">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-secondary" href="/#integrations">
                  Integrations
                </Link>
              </li>
              <li>
                <span className="cursor-default">Security</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
              Company
            </h5>
            <ul className="space-y-5 text-sm font-medium text-white/50">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
              <li>
                <Link className="transition-colors hover:text-secondary" href="/#contact">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
              Connect
            </h5>
            <div className="flex gap-5">
              <a
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-secondary hover:text-secondary"
                href="mailto:hello@fundsteward.com"
                aria-label="Email"
              >
                <span className="material-symbols-outlined text-xl">mail</span>
              </a>
              <span
                className="flex h-12 w-12 cursor-default items-center justify-center rounded-full border border-white/10 text-white/50"
                aria-hidden
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-8 border-t border-white/5 pt-10 md:flex-row">
          <p className="text-[11px] font-medium tracking-wide text-white/30">
            © 2026 FundSteward Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
