"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentShareRow, ProfileRow, SharePermission } from "@/lib/types";

type ShareWithProfile = DocumentShareRow & {
  profiles: Pick<ProfileRow, "email" | "display_name"> | null;
};

type Props = {
  documentId: string;
  open: boolean;
  onClose: () => void;
};

export function ShareDialog({ documentId, open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [shares, setShares] = useState<ShareWithProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadShares() {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("document_shares")
      .select("id, document_id, shared_with_user_id, permission, created_at, profiles(email, display_name)")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      return;
    }
    setShares((data as unknown as ShareWithProfile[]) ?? []);
  }

  useEffect(() => {
    if (open) {
      void loadShares();
      setError(null);
      setStatus(null);
    }
  }, [open, documentId]);

  if (!open) return null;

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);

    const supabase = createClient();
    const { error: shareError } = await supabase.rpc("share_document_by_email", {
      p_document_id: documentId,
      p_email: email.trim(),
      p_permission: permission,
    });

    setBusy(false);

    if (shareError) {
      setError(shareError.message);
      return;
    }

    setStatus(`Shared with ${email.trim()}`);
    setEmail("");
    await loadShares();
  }

  async function revoke(shareId: string) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: revokeError } = await supabase
      .from("document_shares")
      .delete()
      .eq("id", shareId);
    setBusy(false);
    if (revokeError) {
      setError(revokeError.message);
      return;
    }
    await loadShares();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-labelledby="share-title"
        className="w-full max-w-md rounded-2xl bg-[#f7fafc] p-6 shadow-xl ring-1 ring-slate-200"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="share-title" className="font-display text-2xl text-slate-900">
              Share document
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Grant access to another Folio user by email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="viewer@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Permission
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-700"
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
          >
            {busy ? "Sharing…" : "Share"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {status && (
          <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
            {status}
          </p>
        )}

        <div className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            People with access
          </h3>
          <ul className="mt-2 space-y-2">
            {shares.length === 0 && (
              <li className="text-sm text-slate-500">Not shared with anyone yet.</li>
            )}
            {shares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
              >
                <div>
                  <div className="font-medium text-slate-800">
                    {share.profiles?.email ?? share.shared_with_user_id}
                  </div>
                  <div className="text-slate-500">Can {share.permission}</div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void revoke(share.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
