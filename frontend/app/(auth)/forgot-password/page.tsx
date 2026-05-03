"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const labelClass =
  "text-[10px] font-extrabold uppercase tracking-widest text-white/40";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder:text-white/25 transition-all focus:border-secondary focus:outline-none focus:ring-0";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?next=/update-password`
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message || "Could not send reset email.");
      return;
    }
    setSent(true);
  }

  return (
    <section className="editorial-shadow w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
      <h1 className="letter-spacing-tight text-2xl font-extrabold text-white sm:text-3xl">
        Reset password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        We&apos;ll email you a link to choose a new password.
      </p>

      {sent ? (
        <p className="mt-8 text-sm font-medium text-accent">
          Check your inbox for a message from Supabase. The link opens a page where you can set a new
          password. If you don&apos;t see it, check spam or wait a minute and try again.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@organization.org"
              className={inputClass}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-rose-300" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient editorial-shadow w-full rounded-lg px-4 py-4 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-white/50">
        <Link className="font-semibold text-secondary transition-colors hover:text-accent" href="/login">
          Back to sign in
        </Link>
      </p>
    </section>
  );
}
