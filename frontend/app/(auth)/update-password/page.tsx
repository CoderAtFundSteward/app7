"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const labelClass =
  "text-[10px] font-extrabold uppercase tracking-widest text-white/40";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder:text-white/25 transition-all focus:border-secondary focus:outline-none focus:ring-0";

export default function UpdatePasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function applyHashSession() {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const params = new URLSearchParams(raw);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) {
          setReady(true);
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    }

    void applyHashSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(updateError.message || "Could not update password.");
      return;
    }
    setDone(true);
  }

  return (
    <section className="editorial-shadow w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
      <h1 className="letter-spacing-tight text-2xl font-extrabold text-white sm:text-3xl">
        Set new password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Enter a new password for your account.
      </p>

      {done ? (
        <p className="mt-8 text-sm font-medium text-accent">
          Your password was updated. You can sign in with the new password.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {!ready && (
            <p className="text-sm text-white/50">
              Verifying your reset link… If this doesn&apos;t go away, open the link from your email
              again or request a new reset from the sign-in page.
            </p>
          )}
          <div className="space-y-2">
            <label className={labelClass} htmlFor="new-password">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              className={inputClass}
              disabled={!ready}
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repeat password"
              className={inputClass}
              disabled={!ready}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-rose-300" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !ready}
            className="gold-gradient editorial-shadow w-full rounded-lg px-4 py-4 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Saving…" : "Update password"}
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
