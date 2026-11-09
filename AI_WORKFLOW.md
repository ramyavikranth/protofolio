# AI workflow note — Folio

## Tools used

- **Cursor (Composer / agent)** — scaffolding, TipTap wiring, Supabase RLS drafts, UI components, documentation drafts, Vitest cases
- Manual judgment for product scope, UX copy, and verification

## Where AI materially sped things up

- Next.js + TipTap editor shell and toolbar wiring
- First draft of Postgres schema, RLS policies, and `share_document_by_email`
- Dashboard Owned/Shared list logic and share dialog boilerplate
- Import parser + unit tests
- README / architecture / submission scaffolding

## What AI output was changed or rejected

- Rejected building realtime collaboration / CRDT complexity for this timebox
- Rejected `.docx` parsing libraries (scope and reliability risk); kept `.txt` / `.md` only
- Simplified share UX to email + permission instead of enterprise ACL screens
- Tightened RLS and RPC error messages for clearer reviewer demos
- Adjusted visual direction away from generic purple/indigo dashboard aesthetics
- Replaced fragile HTML-only storage suggestions with TipTap JSON

## How correctness was verified

- `npm test` for import parsing (extensions, titles, headings/lists)
- Manual checklist after Supabase wiring:
  1. Owner creates, formats, saves, refreshes
  2. Owner imports `fixtures/sample-notes.md`
  3. Owner shares with viewer email
  4. Viewer sees doc under **Shared with you**
  5. View-only cannot save edits; edit permission can
- `npm run build` for TypeScript / Next production compile once env is present
- Deploy smoke test on Vercel with the same seeded accounts

## Principle

AI accelerated boilerplate and exploration. Product cuts, access-model choices, and final verification stayed human-owned.
