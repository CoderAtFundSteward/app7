"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
    <section className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-950/20 sm:p-8">
      <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">Sign in to access your financial dashboard.</p>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Sign in with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-400">
        New here?{" "}
        <Link href="/signup" className="font-medium text-emerald-300 hover:text-emerald-200">
          Create your account
        </Link>
      </p>
    </section>
  );
}
