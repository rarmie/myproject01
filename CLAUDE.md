# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@progress.md

## What this is

A job application tracker. Next.js 16 (App Router, React 19) is the whole app — UI, API routes, and DB access. `backend/main.py` is a FastAPI stub (a single `/` route) reserved for future Python work; nothing in the frontend calls it yet.

## Commands

```bash
npm run dev            # next dev
npm run build          # next build
npm run lint           # bare `eslint` (flat config, eslint-config-next)

npx prisma generate    # REQUIRED after clone or any schema.prisma edit
npx prisma migrate dev --name <desc>
npx prisma db push     # schema sync without a migration
npx prisma db seed     # runs `tsx prisma/seed.ts`
```

No test framework is installed — there is nothing to run for tests, and adding one is a deliberate decision, not an assumption.

FastAPI backend (venv lives at `backend/venv`, Windows layout):
```bash
backend/venv/Scripts/python -m uvicorn backend.main:app --reload
```

## Prisma setup — the non-obvious parts

This is Prisma 7 with the driver-adapter model, which differs from most Prisma docs and training data:

- **The client is generated to `lib/generated/prisma`, not `node_modules/@prisma/client`.** That directory is gitignored, so a fresh clone has no client until `npx prisma generate` runs. Import from `@/lib/prisma` (the singleton); if you need types, import from `@/lib/generated/prisma/...`, never `@prisma/client`.
- **`datasource db` in `schema.prisma` has no `url`.** Prisma 7 removed it. Connection strings come from two separate places:
  - Runtime: `lib/prisma.ts` builds a `PrismaPg` adapter from `DATABASE_URL` (pooled Supabase connection).
  - CLI/migrations: `prisma.config.ts` loads `DIRECT_URL` via dotenv. **`prisma.config.ts` is gitignored** — it must be recreated locally if missing, or every CLI command fails with P1012/P1013.
- Env is split: `.env` holds `DATABASE_URL` / `DIRECT_URL`; `.env.local` holds `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and Supabase public keys.
- If a query fails with `PrismaClientValidationError` referencing a column that no longer exists, it's a stale build cache: delete `.next/` and re-run `npx prisma generate`.

## Auth and data isolation

`authOptions` is defined and exported from `app/api/auth/[...nextauth]/route.ts`; every server component and route handler imports it from that path. Do not create a second `authOptions` definition — a duplicate previously broke sessions.

Two independent layers, and both matter:

1. **`middleware.ts`** gates whole paths via `withAuth` with an explicit matcher (`/dashboard`, `/jobs`, `/documents`, `/api/jobs`). Note the `(protected)` route group does *not* appear in URLs, so adding a page under `app/(protected)/` does **not** protect it — the matcher must be updated by hand. `/api/concerns` and `/api/register` are intentionally outside the matcher.
2. **Per-request ownership scoping** is what actually isolates user data. Every handler and protected server component calls `getServerSession(authOptions)`, returns 401 / `redirect('/login')` when `session?.user.id` is missing, and includes `userId: session.user.id` in the Prisma `where` clause — including on `update` and `delete`, so one user cannot mutate another's rows. A missing `userId` filter silently returns or edits everyone's records; treat it as a security bug, not a style issue.

Session strategy is `jwt` even though `PrismaAdapter` is configured. The user id reaches the session through the `jwt` → `session` callbacks, and `types/next-auth.d.ts` augments `Session`/`User`/`JWT` to make `session.user.id` typed. Schema changes to the session shape need that file updated too.

Providers are Google + Credentials (bcrypt, cost 12, set in `app/api/register/route.ts`). Google and credentials accounts with the same email are distinct identities in NextAuth — that's the source of `OAuthAccountNotLinked`.

## Conventions

- **Server Components read, API routes write.** Pages under `app/(protected)/` query Prisma directly on the server. Client forms `POST`/`PATCH` to `app/api/*` and then call `router.refresh()` to re-render the server component — there is no client-side data cache to invalidate.
- **Zod validates on both sides.** Client forms use `react-hook-form` + `zodResolver`; the matching route handler re-parses with `safeParse` and returns `{ error: parsed.error.flatten() }` with 400. The two schemas are separate definitions and drift easily — update both.
- `components/ui/` mixes generated shadcn primitives (`button`, `card`, `dialog`, `select`, …, style `radix-nova`, base color neutral) with hand-written app components (`Sidebar.tsx`, `SendConcernsForm.tsx`). Add new shadcn components via the CLI; `components.json` aliases are already configured.
- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`) — avoid manual `useMemo`/`useCallback` churn.
- `@/*` maps to the repo root. Prettier: `singleQuote`, semicolons, 2-space (existing files are inconsistent; match the file you're editing).
- Tailwind 4 via `@tailwindcss/postcss`; theme lives in `app/globals.css` (imported only by the root layout).

## Repo docs

- `progress.md` — running session log of decisions, bugs hit, and their fixes. Imported above (`@progress.md`) so it's loaded into context at the start of every session — check it before re-debugging something that may already be logged there.
- `GEMINI.md` — the owner is deliberately learning this stack and asks for explanation alongside code rather than bare snippets.

## Obsidian vault

Notes are markdown in this repo. Follow these conventions.

- Daily notes: `daily/YYYY-MM-DD.md`. Never create one — I open it via
  Obsidian so the template applies. Append to the existing file only.
- Appending to a daily note: add bullets under the existing heading.
  Never rewrite the file or reorder sections.
- ADRs: `docs/adr/NNNN-slug.md`, sequential. Check the highest existing
  number before creating one.
- Frontmatter: write literal values (`date: 2026-09-08`). `{{date}}` and
  `{{title}}` are Obsidian template placeholders — never emit them.
- Internal links: `[[0003-session-scheduling]]`, no `.md` extension.
- Never touch `.obsidian/`.