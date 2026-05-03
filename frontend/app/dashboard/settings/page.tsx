"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Could not update password.");
      return;
    }

    setNewPassword("");
    setConfirm("");
    setSuccess("Password updated. Use the new password next time you sign in.");
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="letter-spacing-tight text-2xl font-extrabold text-primary sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-on-surface-variant">
          Manage your account security and preferences.
        </p>
      </div>

      <article className="editorial-shadow rounded-xl border border-outline bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-primary">Change password</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Set a new password while you&apos;re signed in. This applies to email sign-in only.
        </p>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-md">
          <div className="space-y-2">
            <label
              className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant"
              htmlFor="settings-new-password"
            >
              New password
            </label>
            <input
              id="settings-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm text-primary focus:border-secondary focus:outline-none focus:ring-0"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant"
              htmlFor="settings-confirm-password"
            >
              Confirm new password
            </label>
            <input
              id="settings-confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm text-primary focus:border-secondary focus:outline-none focus:ring-0"
              placeholder="Repeat password"
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-primary" role="status">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="gold-gradient editorial-shadow rounded-lg px-5 py-3 text-sm font-extrabold uppercase tracking-widest text-primary transition hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      </article>
    </section>
  );
}
