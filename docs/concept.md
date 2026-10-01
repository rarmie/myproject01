# Concept: Job Application Tracker

*Agreed 1 Oct 2026.*

## What it is

A personal job application tracker, built for the owner's own job search and as a portfolio piece.
It keeps every application in one place, and AI helps at each stage: adding a job, judging fit,
writing the application, and following up.

**Who it's for:** the owner, plus recruiters trying it through a demo account. It is not a
multi-user product, so features are judged by whether they make the owner's search easier or show
well in a demo, not by whether they scale to many users.

## Architecture

- **Next.js owns everything stateful:** the UI, sign-in (NextAuth), and all data (Prisma +
  Supabase Postgres). Every read and write of user data goes through it.
- **FastAPI (`backend/`) is a stateless AI service.** It stores nothing and never sees a session.
  For each AI feature, a Next.js route handler checks the session, loads what the call needs with
  Prisma, sends it to FastAPI, and saves any result itself. `/extract` already works this way.
- **The resume is stored as text on `User`** in Prisma. Python's job is only to pull the text out
  of an uploaded PDF and hand it back.

Why stateless: the alternatives were FastAPI reading the same database (two codebases describing
the same tables, and user filtering written twice) or moving the data to FastAPI (a rewrite that
touches auth). At personal scale, everything an AI call needs, even the full job list for the
follow-up agent, fits in one request.

## Features

### Accounts

| Feature | Status |
|---|---|
| Sign-in with Google or email and password | Done, 3 small fixes left |
| Each user's data kept separate | Done |
| Demo account with sample jobs | Planned |
| Daily cap on AI calls per user | Planned |
| "Contact me" form (replaces the concerns form) | Planned, not yet confirmed |

### Jobs

| Feature | Status |
|---|---|
| Add a job | Done |
| Jobs list with search and status filter | Done |
| Job detail page | Partial (refactor Step 4) |
| Edit, delete, quick status change | Planned (refactor Step 5) |
| Requirements list per job | Done; editing comes with the refactor |
| Source: where the job was found | Planned |
| Next action and interview dates | Planned |
| Status history | Planned |
| Contacts per job | Planned (model exists, no UI) |
| Document links per job | Planned (model exists, no UI) |

**Source** is a fixed list (an enum), not free text, so grouping stays reliable. Proposed values:
`LINKEDIN`, `JOB_BOARD`, `COMPANY_SITE`, `REFERRAL`, `RECRUITER`, `OTHER`. It's optional, and
existing jobs show as "Unknown". URL import (F2) can fill it in from the link's domain.

**Next action** is two fields on the job: `nextActionAt` (date and time, stored in UTC) and
`nextAction` (a short note). An interview is one kind of next action, so no separate interviews
table.

**Status history** is a `StatusChange` table: the job, the old status, the new status, and when it
changed. The status update and its history row are written in one `prisma.$transaction`. Creating a
job writes its first row, and a one-off backfill gives existing jobs a starting row dated from
`appliedAt`.

**Documents are links only:** a label plus a URL to where the file already lives (such as Google
Drive). No uploads and no storage service.

### Insights

| Feature | Status |
|---|---|
| Dashboard status counts | Done |
| Dashboard "Upcoming" list of next actions | Planned |
| Reply rate by source | Planned (needs status history and source) |
| Skill trends across saved postings | Planned |

**Skill trends** counts the `requirements` stored on each job and shows the most common ones.
Counting needs no AI. A second step uses AI to group variants ("Postgres" and "PostgreSQL"), and
once the resume is stored, it marks which top skills the resume is missing.

### AI features

| Feature | Status |
|---|---|
| F1 Autofill from a pasted posting | Done, error handling left |
| F2 Import from a URL | Planned |
| F7 Extraction evals | Planned (6 fixture postings so far) |
| F3 Resume match score | Planned |
| F5 Cover letter and interview prep | Planned |
| F6 Follow-up agent: drafts only, the owner approves | Planned |

## Build order

1. Finish the job detail refactor (detail page, edit, delete), plus next action dates and source
2. Status history
3. F1 error handling, then F2 URL import
4. F7 evals
5. F3 match score, then skill trends
6. F5 cover letter and interview prep
7. Contacts and document links UI, then F6 follow-up agent
8. Demo account, AI call cap, deploy

Status history comes early because it only starts collecting data once it exists.

## Dropped

- **F4 semantic search.** Keyword search already finds everything in a few dozen jobs. Meaning-based
  search pays off at hundreds.
- **File uploads for documents.** Links cover the need without a storage service.
- **Kanban board.** Replaced earlier by the list and detail page.

## Still open

- The "contact me" form, the demo account and the AI call cap were proposed but not yet confirmed.
- The list of source values.
