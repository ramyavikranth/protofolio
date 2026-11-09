"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { ShareDialog } from "@/components/ShareDialog";
import { createClient } from "@/lib/supabase/client";
import type { DocumentRow, SharePermission } from "@/lib/types";

type Props = {
  document: DocumentRow;
  userId: string;
  permission: SharePermission | "owner";
};

export function DocumentWorkspace({ document, userId, permission }: Props) {
  const isOwner = permission === "owner";
  const canEdit = permission === "owner" || permission === "edit";

  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState<JSONContent>(document.content_json);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const roleLabel = useMemo(() => {
    if (isOwner) return "Owner";
    if (permission === "edit") return "Shared · can edit";
    return "Shared · view only";
  }, [isOwner, permission]);

  async function save() {
    if (!canEdit) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title cannot be empty.");
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    setError(null);
    const supabase = createClient();
    const { error: saveError } = await supabase
      .from("documents")
      .update({
        title: trimmed,
        content_json: content,
      })
      .eq("id", document.id);

    if (saveError) {
      setError(saveError.message);
      setSaveState("error");
      return;
    }

    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm font-semibold text-teal-800 hover:underline"
        >
          ← Documents
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700">
            {roleLabel}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Share
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => void save()}
              className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900"
            >
              {saveState === "saving" ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      <input
        value={title}
        disabled={!canEdit}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full bg-transparent font-display text-4xl text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-70"
        placeholder="Untitled document"
      />

      {(error || saveState === "saved") && (
        <p
          className={`mb-4 text-sm ${
            error ? "text-red-700" : "text-teal-800"
          }`}
        >
          {error ?? "Saved"}
        </p>
      )}

      <DocumentEditor
        key={document.id}
        initialContent={document.content_json}
        editable={canEdit}
        onChange={setContent}
      />

      <p className="mt-3 text-xs text-slate-500">
        Signed in as user {userId.slice(0, 8)}… · Formatting is stored as TipTap
        JSON.
      </p>

      <ShareDialog
        documentId={document.id}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
