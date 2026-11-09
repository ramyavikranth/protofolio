"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string;
  initialDisplayName: string;
};

export function ProfileForm({ userId, email, initialDisplayName }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Display name cannot be empty.");
      return;
    }

    setBusy(true);
    setError(null);
    setStatus(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert({
      id: userId,
      email: email.toLowerCase(),
      display_name: trimmed,
    });

    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStatus("Profile saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div>
        <h1 className="font-display text-3xl text-slate-900">Your profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update how your name appears when sharing documents.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          value={email}
          disabled
          className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Email is managed by Supabase Auth and cannot be changed here.
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Display name
        <input
          type="text"
          required
          maxLength={80}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {status && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {status}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
