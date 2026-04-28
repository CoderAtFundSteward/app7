"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const labelClass =
  "text-[10px] font-extrabold uppercase tracking-widest text-white/40";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder:text-white/25 transition-all focus:border-secondary focus:outline-none focus:ring-0";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateInputs() {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message || "Unable to sign up.");
      setLoading(false);
      return;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError("An account with this email already exists. Please log in instead.");
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError(
        "Signup successful. Please check your email to confirm your account, then log in."
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="editorial-shadow w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
      <h1 className="letter-spacing-tight text-2xl font-extrabold text-white sm:text-3xl">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Get secure access to your membership and accounting data.
      </p>

      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="signup-name">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Alex Morgan"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
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
          <label className={labelClass} htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            className={inputClass}
          />
        </div>
        {error && (
          <p
            className={`text-sm font-medium ${
              error.startsWith("Signup successful") ? "text-accent" : "text-rose-300"
            }`}
            role="status"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="gold-gradient editorial-shadow w-full rounded-lg px-4 py-4 text-sm font-extrabold uppercase tracking-widest text-primary transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link className="font-semibold text-secondary transition-colors hover:text-accent" href="/login">
          Log in
        </Link>
      </p>
    </section>
  );
}
