import Link from "next/link";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";

export default function MarketingLanding() {
  return (
    <div className="bg-background text-on-surface">
      <MarketingNav />

      <section className="relative overflow-hidden px-6 pb-36 pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-secondary">
              Now in Private Beta
            </div>
            <h1 className="letter-spacing-tight text-5xl font-extrabold leading-[1.1] text-primary lg:text-7xl">
              Fund-level financial intelligence for mission-driven organizations.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              Automated financial oversight by connecting your organization&apos;s mission to your
              accounting tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                className="gold-gradient editorial-shadow rounded-lg px-10 py-5 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.02]"
                href="/#contact"
              >
                Request a Demo
              </Link>
              <Link
                className="rounded-lg border-2 border-primary px-10 py-5 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
                href="/#how-it-works"
              >
                Learn More
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 pt-8">
              <div className="flex items-center gap-2.5 text-primary">
                <span
                  className="material-symbols-outlined text-xl text-secondary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check_circle
                </span>
                <span className="text-sm font-bold tracking-tight">Automated reconciliation</span>
              </div>
              <div className="flex items-center gap-2.5 text-primary">
                <span
                  className="material-symbols-outlined text-xl text-secondary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check_circle
                </span>
                <span className="text-sm font-bold tracking-tight">Real-time reporting</span>
              </div>
              <div className="flex items-center gap-2.5 text-primary">
                <span
                  className="material-symbols-outlined text-xl text-secondary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check_circle
                </span>
                <span className="text-sm font-bold tracking-tight">Mission-aligned insights</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-6 py-32" id="problem">
        <div className="mx-auto max-w-7xl">
          <div className="mb-24 text-center">
            <h2 className="letter-spacing-tight mb-6 text-4xl font-extrabold text-white">
              The high cost of manual reporting.
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60">
              Manual reconciliation and fund accounting shouldn&apos;t cost you an entire staff
              salary. Reclaim your time for the mission.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-10 transition-colors hover:border-secondary/30">
              <span className="material-symbols-outlined mb-6 block text-4xl text-secondary">
                schedule
              </span>
              <h3 className="mb-3 text-2xl font-bold text-white">Extensive hours per month</h3>
              <p className="text-sm leading-relaxed text-white/50">
                The significant time spent by non-profit admins manually syncing giving data with
                accounting software.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-10 transition-colors hover:border-secondary/30">
              <span className="material-symbols-outlined mb-6 block text-4xl text-secondary">
                warning
              </span>
              <h3 className="mb-3 text-2xl font-bold text-white">Significant Monthly Overhead</h3>
              <p className="text-sm leading-relaxed text-white/50">
                Labor costs hidden in spreadsheets, manual entry, and year-end audit preparation
                delays.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-10 transition-colors hover:border-secondary/30">
              <span className="material-symbols-outlined mb-6 block text-4xl text-secondary">
                verified
              </span>
              <h3 className="mb-3 text-2xl font-bold text-white">Substantial Annual Savings</h3>
              <p className="text-sm leading-relaxed text-white/50">
                Automated fund accounting reduces overhead and provides board-ready reports in
                seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-32" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <h2 className="letter-spacing-tight mb-24 text-center text-4xl font-extrabold text-primary">
            Connect. Sync. Insight.
          </h2>
          <div className="relative grid gap-16 md:grid-cols-3">
            <div className="absolute left-[15%] right-[15%] top-12 z-0 hidden h-[2px] bg-outline md:block" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="gold-gradient editorial-shadow mb-8 flex h-24 w-24 items-center justify-center rounded-full border-8 border-white text-3xl font-extrabold text-primary">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">Connect Platforms</h3>
                <p className="px-4 text-sm leading-relaxed text-on-surface-variant">
                  Securely link your QuickBooks Online and giving platforms like Tithe.ly in minutes.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="gold-gradient editorial-shadow mb-8 flex h-24 w-24 items-center justify-center rounded-full border-8 border-white text-3xl font-extrabold text-primary">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">Automated Sync</h3>
                <p className="px-4 text-sm leading-relaxed text-on-surface-variant">
                  FundSteward maps every donation to the correct chart of accounts and fund class
                  automatically.
                </p>
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="gold-gradient editorial-shadow mb-8 flex h-24 w-24 items-center justify-center rounded-full border-8 border-white text-3xl font-extrabold text-primary">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-primary">Instant Reporting</h3>
                <p className="px-4 text-sm leading-relaxed text-on-surface-variant">
                  Generate statement of activities and restricted fund reports with one click for
                  board meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-32" id="integrations">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="letter-spacing-tight mb-20 text-4xl font-extrabold text-primary">
            Built on the tools you already use.
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: "account_balance", title: "QuickBooks", text: "The source of truth for your ledger." },
              { icon: "volunteer_activism", title: "Tithe.ly", text: "Direct integration for church giving." },
              { icon: "event_note", title: "Planning Center", text: "Seamless member data syncing." },
              { icon: "payments", title: "Pushpay", text: "Enterprise donation management." },
              { icon: "security", title: "Plaid", text: "Bank-level secure connectivity." }
            ].map((item) => (
              <div
                key={item.title}
                className="editorial-shadow flex flex-col items-center gap-5 rounded-xl border border-outline bg-white p-10 transition-all hover:-translate-y-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-background">
                  <span className="material-symbols-outlined text-3xl text-primary">{item.icon}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-32" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="letter-spacing-tight mb-6 text-4xl font-extrabold text-primary">
              Pricing that replaces your CPA invoice.
            </h2>
            <p className="text-lg text-on-surface-variant">
              Transparent pricing for every stage of institutional growth.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="editorial-shadow space-y-8 rounded-2xl border border-outline bg-background p-12 text-center">
              <h3 className="letter-spacing-tight text-3xl font-extrabold text-primary">
                Customized for your organization&apos;s scale.
              </h3>
              <p className="mx-auto max-w-xl text-lg leading-relaxed text-on-surface-variant">
                Whether you are a local community church or a global mission network, our platform
                scales to your complexity. Contact us for a bespoke quote tailored to your volume
                and reporting needs.
              </p>
              <div className="pt-4">
                <Link
                  className="gold-gradient editorial-shadow inline-block rounded-lg px-12 py-5 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.02]"
                  href="/#contact"
                >
                  Request Pricing Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-6 py-32" id="contact">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="letter-spacing-tight mb-6 text-4xl font-extrabold text-white">
            Request early access.
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-lg text-white/60">
            We are currently in a private beta with selected mission-driven partners. Apply now to be
            first in line for our next rollout.
          </p>
          <div className="editorial-shadow rounded-2xl border border-white/10 bg-white/5 p-12 text-left">
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                  Full Name
                </label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/20 transition-all focus:border-secondary focus:outline-none focus:ring-0"
                  placeholder="Jane Doe"
                  type="text"
                  name="name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                  Organization
                </label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/20 transition-all focus:border-secondary focus:outline-none focus:ring-0"
                  placeholder="Grace Community"
                  type="text"
                  name="organization"
                />
              </div>
            </div>
            <div className="mb-10 space-y-3">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                Work Email
              </label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/20 transition-all focus:border-secondary focus:outline-none focus:ring-0"
                placeholder="jane@organization.org"
                type="email"
                name="email"
              />
            </div>
            <a
              className="gold-gradient editorial-shadow block w-full rounded-lg py-5 text-center text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.01]"
              href="mailto:hello@fundsteward.com?subject=FundSteward%20early%20access"
            >
              Send Us an Email
            </a>
            <p className="mt-4 text-center text-xs text-white/40">
              Prefer email? Use the button above to open your mail client, or{" "}
              <Link className="text-secondary underline hover:text-accent" href="/signup">
                create an account
              </Link>{" "}
              to access the product.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
