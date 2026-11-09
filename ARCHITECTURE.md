# Architecture note — Folio

## Goal

Ship a coherent product slice of a collaborative document editor under a 3–4 hour build target (assignment allows 4–6 hours): create/edit, file import, sharing, and persistence — not a Google Docs clone.

## What was prioritized

1. **Editable document lifecycle** — create, rename, TipTap rich text, explicit save, reopen after refresh.
2. **Persistence that preserves structure** — TipTap JSON in Postgres instead of plain HTML strings, so headings/lists round-trip cleanly.
3. **Sharing with visible ownership** — `owner_id` plus `document_shares`, dashboard sections for Owned vs Shared, share-by-email RPC.
4. **Product-relevant import** — `.txt` / `.md` → new document. Clear unsupported-type messaging.
5. **Deployability** — Next.js on Vercel + free Supabase; reviewers need zero paid services.

## What was deprioritized

- Real-time multiplayer cursors / CRDT sync
- Comments / suggestion mode
- Version history
- PDF / DOCX export or DOCX import
- Enterprise RBAC beyond owner / view / edit
- Autosave (explicit Save keeps failure modes obvious in a short demo)

## System shape

```text
Browser (Next.js App Router)
  ├─ TipTap editor (client)
  ├─ Supabase JS (auth session + CRUD)
  └─ RPC share_document_by_email
        │
        ▼
Supabase
  ├─ Auth (email/password)
  ├─ Postgres tables: profiles, documents, document_shares
  └─ RLS policies enforcing owner vs shared access
```

## Key design decisions

- **Supabase RLS as the access layer** — avoids a custom backend ACL for this scope; policies encode “owner full access / shared read or edit.”
- **Security-definer RPC for share-by-email** — looking up users by email safely without exposing a broad user directory write API.
- **Client-heavy mutations with server auth gating** — middleware protects routes; mutations use the user JWT so RLS applies.
- **Import parser as a pure function** — easy to unit test without spinning up the database.

## Tradeoffs

- Share targets must already have a Folio account (acceptable for seeded-demo sharing).
- View-only shared users cannot rename from the dashboard; edit permission is available when granted.
- Without env vars configured, the app cannot talk to Supabase — documented in `.env.example` and README.

## If another 2–4 hours

- Soft autosave with conflict messaging
- Attachment storage for non-text files
- Basic presence indicator (“viewer is here”)
- Export to Markdown
