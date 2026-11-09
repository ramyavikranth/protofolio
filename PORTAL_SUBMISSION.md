# Ajaia – AI-Native Full Stack Developer Assignment

## Project Overview
Built a lightweight collaborative document editor inspired by Google Docs, scoped as **Folio**: create/edit, `.txt`/`.md` import, ownership + sharing, and Supabase persistence.

## Live Application
[Paste deployed application URL]

## Source Code
[Paste GitHub repository URL]

## Google Drive Deliverables
[Paste Google Drive folder URL]

## Features Implemented
- Create, edit, rename, and save documents.
- Rich-text formatting (bold, italic, underline, headings, lists).
- File upload and document import (`.txt` / `.md` only).
- Document ownership and sharing by email.
- Separate views for owned and shared documents.
- Persistent Supabase database storage (TipTap JSON).
- Basic validation and error handling.
- Automated tests for the import parser (`npm test`).

## Test Credentials
Owner:
- Email: owner@folio.test
- Password: FolioDemo1!

Shared User:
- Email: viewer@folio.test
- Password: FolioDemo1!

## Technology Stack
- React (Next.js)
- TypeScript
- Supabase
- TipTap
- Vercel

## Testing
Ran `npm test` for import parsing. Manually verified create/edit/save/refresh, file import, and owner→viewer sharing with Owned vs Shared lists after Supabase + Vercel wiring.

## AI Workflow
Used Cursor to accelerate scaffolding, TipTap wiring, RLS drafts, and docs. Rejected AI suggestions for realtime CRDT collaboration, DOCX parsing, and enterprise ACL. Verified with unit tests and a manual sharing walkthrough.

## Architecture and Prioritization
Prioritized the essential document lifecycle, persistence, file import, and sharing workflows. Advanced real-time collaboration and version history were intentionally deprioritized. Details in `ARCHITECTURE.md`.

## Known Limitations
- No realtime collaborative cursors.
- No comments, suggestions, or version history.
- Import limited to `.txt` and `.md` (not `.docx`).
- Share targets must already have Folio accounts.
- Demo login works best with Supabase email confirmation disabled.

## Future Improvements
- Real-time collaborative editing.
- Document version history.
- Comments and suggestions.
- Advanced permission management.
- Soft autosave and Markdown export.
