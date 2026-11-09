"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { importFileToDocument } from "@/lib/import-file";
import { EMPTY_DOC, type DocumentRow } from "@/lib/types";

type Props = {
  userId: string;
  userEmail: string;
  displayName?: string | null;
};

export function Dashboard({ userId, userEmail, displayName }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [owned, setOwned] = useState<DocumentRow[]>([]);
  const [shared, setShared] = useState<DocumentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const greetingName = displayName?.trim() || userEmail;

  async function loadDocuments() {
    const supabase = createClient();
    setError(null);

    const { data: ownedDocs, error: ownedError } = await supabase
      .from("documents")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (ownedError) {
      setError(ownedError.message);
      return;
    }

    const { data: shareRows, error: shareError } = await supabase
      .from("document_shares")
      .select("document_id")
      .eq("shared_with_user_id", userId);

    if (shareError) {
      setError(shareError.message);
      return;
    }

    const sharedIds = (shareRows ?? []).map((row) => row.document_id);
    let sharedDocs: DocumentRow[] = [];

    if (sharedIds.length > 0) {
      const { data, error: sharedDocsError } = await supabase
        .from("documents")
        .select("*")
        .in("id", sharedIds)
        .order("updated_at", { ascending: false });

      if (sharedDocsError) {
        setError(sharedDocsError.message);
        return;
      }
      sharedDocs = (data as DocumentRow[]) ?? [];
    }

    setOwned((ownedDocs as DocumentRow[]) ?? []);
    setShared(sharedDocs);
  }

  useEffect(() => {
    void loadDocuments();
  }, [userId]);

  async function createDocument() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setBusy(false);
      setError(userError?.message ?? "You must be signed in to create a document.");
      return;
    }

    const { data, error: createError } = await supabase
      .from("documents")
      .insert({
        owner_id: user.id,
        title: "Untitled document",
        content_json: EMPTY_DOC,
      })
      .select("id")
      .single();
    setBusy(false);

    if (createError || !data) {
      setError(createError?.message ?? "Could not create document");
      return;
    }
    router.push(`/documents/${data.id}`);
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const imported = await importFileToDocument(file);
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error(userError?.message ?? "You must be signed in to import.");
      }

      const { data, error: createError } = await supabase
        .from("documents")
        .insert({
          owner_id: user.id,
          title: imported.title,
          content_json: imported.content_json,
        })
        .select("id")
        .single();

      if (createError || !data) {
        throw new Error(createError?.message ?? "Import failed");
      }
      router.push(`/documents/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveRename(docId: string) {
    const title = renameValue.trim();
    if (!title) {
      setError("Document title cannot be empty.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: renameError } = await supabase
      .from("documents")
      .update({ title })
      .eq("id", docId);
    setBusy(false);
    if (renameError) {
      setError(renameError.message);
      return;
    }
    setRenamingId(null);
    await loadDocuments();
  }

  async function deleteDocument(doc: DocumentRow) {
    const ok = window.confirm(`Delete “${doc.title}”? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);
    setBusy(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (renamingId === doc.id) {
      setRenamingId(null);
    }
    await loadDocuments();
  }

  function DocList({
    docs,
    emptyLabel,
    canRename,
  }: {
    docs: DocumentRow[];
    emptyLabel: string;
    canRename: boolean;
  }) {
    if (docs.length === 0) {
      return <p className="text-sm text-slate-500">{emptyLabel}</p>;
    }

    return (
      <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
        {docs.map((doc) => (
          <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              {renamingId === doc.id ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveRename(doc.id);
                  }}
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-teal-800 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="rounded-md px-2 py-1 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="block truncate font-medium text-slate-900 hover:text-teal-800"
                  >
                    {doc.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Updated {new Date(doc.updated_at).toLocaleString()}
                  </p>
                </>
              )}
            </div>
            {canRename && renamingId !== doc.id && (
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setRenamingId(doc.id);
                    setRenameValue(doc.title);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-teal-800 disabled:opacity-50"
                >
                  Rename
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void deleteDocument(doc)}
                  className="text-xs font-semibold text-red-700 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#dceeea_0%,#e8eef7_55%,#f7fafc_100%)] p-6 ring-1 ring-slate-200/80">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Your workspace
        </p>
        <h1 className="mt-1 font-display text-3xl text-slate-900 sm:text-4xl">
          Welcome back, {greetingName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create documents, import notes, and share drafts with teammates.
          Supported uploads: <strong>.txt</strong> and <strong>.md</strong> only.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void createDocument()}
            className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
          >
            New document
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            Import .txt / .md
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => void handleImport(e.target.files?.[0])}
          />
        </div>
      </section>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Owned by you
        </h2>
        <DocList
          docs={owned}
          emptyLabel="No documents yet. Create one or import a file."
          canRename
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Shared with you
        </h2>
        <DocList
          docs={shared}
          emptyLabel="Nothing shared with you yet."
          canRename={false}
        />
      </section>
    </main>
  );
}
