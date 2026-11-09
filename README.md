# Folio

Lightweight collaborative document editor (Ajaia AI-Native Full Stack assignment).

Users can create and rename documents, edit rich text in the browser, import `.txt` / `.md` files, share documents with other users, and persist everything in Supabase.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- TipTap rich-text editor
- Supabase Auth + Postgres (RLS)
- Vercel deployment target

## Features

- Create / rename / save / reopen documents
- Rich text: bold, italic, underline, headings, bulleted and numbered lists
- Import `.txt` or `.md` into a new editable document (other types rejected in UI)
- Owner vs shared document lists
- Share by email (view or edit)
- Persistence via Supabase after refresh

## Local setup

### 1. Install

```bash
cd folio
npm install
cp .env.example .env.local
```

### 2. Create a free Supabase project

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Open **SQL Editor** and run the full contents of [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
3. In **Authentication → Providers → Email**:
   - Enable Email
   - For the assignment demo, turn **off** “Confirm email” so seeded users can sign in immediately
4. Copy **Project URL** and **anon public** key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Seed demo users

In Supabase **Authentication → Users → Add user** (or sign up from the Folio UI):

| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Owner  | `owner@folio.test` | `FolioDemo1!` |
| Viewer | `viewer@folio.test`| `FolioDemo1!` |

The `handle_new_user` trigger creates matching `profiles` rows automatically.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Test

```bash
npm test
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel (free).
3. Set the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
4. Deploy.
5. In Supabase **Authentication → URL configuration**, add your Vercel URL to **Site URL** and **Redirect URLs**.

## Demo flow for reviewers

1. Sign in as `owner@folio.test`.
2. Create a document, apply formatting, Save, refresh — content remains.
3. Import `fixtures/sample-notes.md`.
4. Share the document with `viewer@folio.test`.
5. Sign out, sign in as `viewer@folio.test`.
6. Confirm the document appears under **Shared with you**.

## Supported file uploads

Only `.txt` and `.md`. Stated in the dashboard UI and here. `.docx` was intentionally deferred.

## Project layout

- `src/app` — login, dashboard, document pages
- `src/components/editor` — TipTap editor + toolbar
- `src/lib` — Supabase clients, import parser, types
- `supabase/migrations` — schema, RLS, share RPC

## Related docs

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — prioritization and design
- [`AI_WORKFLOW.md`](AI_WORKFLOW.md) — AI usage note
- [`SUBMISSION.md`](SUBMISSION.md) — deliverables checklist
- [`WALKTHROUGH_URL.txt`](WALKTHROUGH_URL.txt) — video link placeholder
