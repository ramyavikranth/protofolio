# SUBMISSION — Folio (Ajaia AI-Native Full Stack Developer Assignment)

Candidate: Ramyakrishna Vandanapu (ramya.vandanapu25@gmail.com)

## Included in this package

- [x] Source code (`folio/` Next.js app)
- [x] `README.md` — local setup and run instructions
- [x] `ARCHITECTURE.md` — prioritization and design
- [x] `AI_WORKFLOW.md` — AI usage note
- [x] `SUBMISSION.md` — this inventory
- [x] `WALKTHROUGH_URL.txt` — walkthrough video URL (paste after recording)
- [x] `.env.example` — required env vars
- [x] `supabase/migrations/001_initial.sql` — schema + RLS
- [x] Automated test: `src/lib/import-file.test.ts` (`npm test`)
- [x] Sample import file: `fixtures/sample-notes.md`
- [x] Live product URL — https://documentcreation-drab.vercel.app
- [x] Google Drive folder URL — https://drive.google.com/drive/folders/1tORNJ0lJc1-XBXG8QhGlqtpz1w4BhfJT?usp=sharing
- [x] GitHub repository URL — https://github.com/ramyavikranth/protofolio

## Live application

https://documentcreation-drab.vercel.app

## Source code

https://github.com/ramyavikranth/protofolio

## Google Drive deliverables

https://drive.google.com/drive/folders/1tORNJ0lJc1-XBXG8QhGlqtpz1w4BhfJT?usp=sharing

## Features implemented

- Create, edit, rename, and save documents
- Rich-text formatting (bold, italic, underline, headings, lists)
- File upload / import (`.txt`, `.md` → new document)
- Document ownership and sharing by email
- Separate Owned vs Shared views
- Persistent Supabase Postgres storage with TipTap JSON
- Basic validation and error handling
- One meaningful automated test suite for import parsing

## Test credentials

Create these users in Supabase Auth (or via Sign up), password for both:

Owner:

- Email: `owner@folio.test`
- Password: `FolioDemo1!`

Shared user:

- Email: `viewer@folio.test`
- Password: `FolioDemo1!`

## Technology stack

- React (Next.js App Router)
- TypeScript
- Supabase
- TipTap
- Vercel

## Testing

Automated:

```bash
npm test
```

Covers supported extensions, title derivation, and markdown-ish conversion to TipTap JSON.

Manual verification:

- Create / format / save / refresh
- Import `fixtures/sample-notes.md`
- Share owner → viewer; confirm Shared list
- Confirm view-only vs edit permission behavior

## AI workflow

See `AI_WORKFLOW.md`. Cursor was used to accelerate implementation; AI-generated scope expansions (realtime, DOCX, enterprise ACL) were rejected. Flows were verified with tests and a manual share demo.

## Architecture and prioritization

See `ARCHITECTURE.md`. Prioritized document lifecycle, persistence, import, and sharing. Deprioritized realtime collaboration, comments, version history, and advanced permissions.

## What is working

- Auth (email/password via Supabase)
- Document CRUD for owners
- TipTap editing + save/reopen with formatting preserved
- `.txt` / `.md` import
- Share by email + Owned/Shared distinction
- RLS-backed access checks

## What is incomplete / limited

- Walkthrough video URL still pending in `WALKTHROUGH_URL.txt`
- No realtime multiplayer editing
- No `.docx` import
- No version history or comments
- Email confirmation must be disabled (or emails confirmed) for instant demo login
- Profile display-name editing is supported; password change is not in-app

## What I would build next (2–4 hours)

- Soft autosave + clearer dirty-state UX
- Presence indicator for shared viewers
- Markdown export
- Optional attachment upload via Supabase Storage

## Walkthrough video

https://www.loom.com/share/31eb8d41199f4ff1bc7260a10599fb89

Also stored in `WALKTHROUGH_URL.txt`.
