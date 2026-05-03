"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const labelClass =
  "text-[10px] font-extrabold uppercase tracking-widest text-white/40";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder:text-white/25 transition-all focus:border-secondary focus:outline-none focus:ring-0";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get("redirectTo") ?? "/dashboard", [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const origin = window.location.origin;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/dashboard`
      }
    });

    if (oauthError) {
      setError(oauthError.message || "Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <section className="editorial-shadow w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
      <h1 className="letter-spacing-tight text-2xl font-extrabold text-white sm:text-3xl">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Sign in to access your financial dashboard.
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mt-8 w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sign in with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@organization.org"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className={labelClass} htmlFor="login-password">
              Password
            </label>
            <Link
              className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-accent"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        New here?{" "}
        <Link className="font-semibold text-secondary transition-colors hover:text-accent" href="/signup">
          Create your account
        </Link>
      </p>
    </section>
  );
}
