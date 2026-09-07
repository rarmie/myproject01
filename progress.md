# Project Progress: Job Application Tracker

This document follows the project's evolution, detailing the architecture, data flow, and session-by-session achievements.

## 1. High-Level Data Flow

The flow of data depends on whether you are reading (viewing jobs) or writing (adding a new job).

### Reading Data (Database -> Website)
1. **Request:** You navigate to the `/jobs` page in your browser.
2. **Server-Side Fetching:** The file `app/(protected)/jobs/page.tsx` is a Server Component. Before the page even reaches your browser, the code inside it runs on the server.
3. **Database Query:** It calls `prisma.jobApplication.findMany()`.
4. **Prisma Translation:** The Prisma Client translates this JavaScript command into a SQL query and sends it to your PostgreSQL database.
5. **Rendering:** The database returns the job records. The server injects this data into your React components to generate HTML.
6. **Response:** The final HTML (containing your job list) is sent to your browser.

### Saving Data (Website -> Database)
1. **Interaction:** You fill out a form (e.g., `AddFormJob.tsx`) and click "Submit".
2. **API Call:** The browser sends a POST request with the form data (in JSON format) to `/api/jobs`.
3. **Route Handling:** The file `app/api/jobs/route.ts` receives this request.
4. **Validation:** It uses Zod to ensure the data (company name, role, etc.) is valid.
5. **Database Creation:** It calls `prisma.jobApplication.create()`.
6. **Confirmation:** Prisma saves the data to the database, and the API sends a "Success" response back to the browser.

---

## 2. Detailed File Breakdown

| File Path | Role | What the Code Does |
| :--- | :--- | :--- |
| `prisma/schema.prisma` | Data Architect | Defines database "Blueprints" (Models). It tells the database exactly what columns a `JobApplication` or `User` should have. |
| `lib/prisma.ts` | Database Connector | Initializes the connection to PostgreSQL. Exports a single `prisma` instance used to communicate with the database. |
| `app/api/jobs/route.ts` | Gatekeeper (API) | Acts as a bridge for the frontend. Handles GET (fetch all) and POST (create new) requests. |
| `app/(protected)/jobs/page.tsx` | Visual Presenter | A React component that fetches data directly on the server. Groups jobs into columns (Wishlist, Applied, etc.). |
| `backend/main.py` | Specialized Worker | A FastAPI (Python) server for tasks like PDF parsing, data science, or heavy background processing. |      
| `components/ui/` | Visual Building Blocks | Reusable Shadcn/UI components like Card, Badge, and Button. Handles presentation only. |

---

## Session Logs

### May 20, 2026
**Project State & Progress**
NextAuth is fully configured with Google and Credentials providers. Database is connected via Prisma.

**Completed Tasks**
- **Auth Refactor:** Integrated `PrismaAdapter`, `CredentialsProvider` with Zod/Bcrypt, and `GoogleProvider`.
- **Layout Fixes:** Added explicit `React` import to `app/layout.tsx` and centered login UI.        
- **Login UI:** Refactored `LoginCard.tsx` using `react-hook-form` and `zod`.
- **Type Safety:** Created `types/next-auth.d.ts` for session user ID augmentation.

### May 24, 2026
**Completed Tasks**
- **Route Protection:** Expanded middleware to protect `/dashboard`, `/jobs`, and `/documents`.     
- **Database Seeding:** Updated seed script with hashed passwords using `bcryptjs`.
- **Documentation:** Created high-level authentication overview and API route explanations.
- **Logout:** Created `LogoutButton.tsx` component.

### May 26, 2026
**Completed Tasks**
- **Data Protection:** Established user-specific data fetching patterns.
- **Type Fixes:** Resolved `authOptions` export errors in NextAuth.
- **UI Optimization:** Fixed global state pollution in status counters.
- **Database Troubleshooting:** Fixed Supabase connection pooling issues (Transaction vs Session mode).

### May 28, 2026
**Completed Tasks**
- **Research:** Identified gaps in registration scaffolding and missing Prisma models for NextAuth adapters.
- **Implementation Planning:** Created `implementation_plan.md` for the full registration architecture.

### May 29, 2026
**Completed Tasks**
- **Code Audit & Bug Fixes:**
  - Fixed critical logic in `RegisterCard.tsx` (using `response.ok` instead of `result.ok`).        
  - Secured registration UI with `type="password"` and comprehensive error feedback.
  - Corrected Zod imports and removed unused code in auth components.
- **Full Feature Deployment:**
  - Staged and committed the entire authentication system (Google/Credentials).
  - Deployed protected dashboard routes and foundational database schema.
  - Synchronized local repository with remote origin with a detailed commit history.
- **Repository Maintenance:**
  - Verified a clean working tree after successful push.

### June 1, 2026
**Session Progress: Authentication & User Isolation**

**Objectives Accomplished**
- **Dynamic User IDs**: Transitioned from hardcoded `test-user-id` to session-based identification across all API routes.
- **Data Isolation**: Verified and enforced ownership checks in `PATCH` and `DELETE` operations to prevent cross-user data modification.
- **Landing Page Guidance**: Provided configuration steps for changing the application's root landing page.

**Identified Code Fixes**
- **Prisma Schema**: Identified necessary typos fixes (`emailVerified`, `token`) and the addition of `Account`, `Session`, and `VerificationToken` models for NextAuth adapter support.
- **Auth Configuration**: Identified a duplicate `authOptions` definition in `app/api/auth/[...nextauth]/route.ts` causing session failures.
- **Server Components**: Corrected the use of `NextResponse` in `app/(protected)/jobs/page.tsx`, switching it to `redirect("/login")` for proper server-side authentication handling.

**Errors & Troubleshooting**
- **Prisma 7 Compatibility**: Navigated the removal of the `url` property from `schema.prisma`. Fixed P1012 and P1013 errors by using CLI flags for database synchronization.
- **Prisma Filtering**: Identified that passing `undefined` to Prisma filters returns all records, highlighting the importance of explicit session validation.

**Current Status & Next Steps**
- **Database Sync**: The schema is ready; the next step is to run `npx prisma db push --url "..."` with the correct connection string to create OAuth tables.
- **Session Refresh**: Users must log out and back in to populate the new `id` field in their session cookies.
- **Verification**: Once tables are created, test the Google login flow and verify that job data remains isolated between different accounts.


## June 3, 2026

# Progress Log
    2
    3 ## Authentication & Database Fixes
    4 - **Resolved Login `401 Unauthorized` / Schema Mismatch:**
    5     - Diagnosed `Runtime PrismaClientValidationError` caused by stale build cache
      referencing a non-existent `User.avatarUrl` column.
    6     - **Action:** Cleared `.next` build directory and forced regeneration of the
      Prisma Client (`npx prisma generate`).
    7 - **Investigated Google OAuth `OAuthAccountNotLinked` Error:**
    8     - Identified that existing Credentials-based accounts and new Google-based
      accounts for the same email are treated as distinct identities by NextAuth.
    9     - **Proposed Solution:** Recommended enabling `allowDangerousEmailAccountLinking`
      in provider configuration to allow automatic merging.
   10
   11 ## Feature Implementation: Job CRUD
   12 - **Revised Implementation Plan:**
   13     - Shifted from a modal-based workflow to a dedicated `JobDetailPage`
      (`/jobs/[id]`) for editing and deleting applications.
   14     - Acknowledged Server/Client component boundaries: Created a plan to use a
      client-side wrapper or form component within the detail page to handle interactivity.
   15 - **Navigation & Page Fixes:**
   16     - **Resolved Link Warning:** Moved `key` prop from `Card` to `Link` component in
      `jobs/page.tsx` to fix React list warnings.
   17     - **Resolved Param Access Error:** Updated `JobDetailPage` to await the `params`
      object (required in Next.js 15+), resolving `id: undefined` errors in Prisma queries.

## August 5, 2026

### Bug Audit Session

**Objective:** Find and fix bugs across the auth, API, and UI layers.

**Bugs identified**

1. **IDOR on the job detail page** (`app/(protected)/jobs/[id]/page.tsx`) — page fetched a job by `id` alone, with no session check and no `userId` filter. Any logged-in user could view another user's job by changing the ID in the URL.
2. **`/api/concerns` requiring a session** (`app/api/concerns/route.ts`) — initially flagged as a bug, since `Concern.userId` is optional in the schema and the route sits outside `middleware.ts`'s matcher, both of which look like signals that anonymous submission should work. Confirmed with the project owner: concerns are intended to be logged-in-only. **The existing 401 behavior is correct — not a bug, no fix needed.** The optional `userId` field on `Concern` is vestigial from that earlier assumption; tightening it to required is a deliberate future schema change, not a bug fix.
3. **Job form ignores fetch failures** (`components/AddFormJob.tsx`) — the `fetch()` response was discarded entirely (not even assigned to a variable); no `res.ok` check, no `try/catch` around the network call, `error` state was set but never rendered, `isLoading` was never reset.
4. **Same pattern in the concern form** (`components/ui/SendConcernsForm.tsx`) — no `res.ok` check or try/catch, plus a `Content-Type: 'concern/json'` typo (should be `application/json`).
5. **Debug logging of auth internals** (`app/api/auth/[...nextauth]/route.ts`) — `console.log` calls inside `authorize()` print the login email, whether the account has a password set, and whether the password comparison matched, on every login attempt.
6. **Unvalidated `status` query param** (`app/api/jobs/route.ts`, `app/api/concerns/route.ts`) — `status as any` is passed straight into the Prisma filter; an invalid value throws a raw 500 instead of a clean 400.

**Fixes applied this session**

- `app/(protected)/jobs/[id]/page.tsx`: added a `getServerSession` check and `userId: session.user.id` to the `findUnique` where clause, closing the IDOR (#1). **Introduced a follow-up bug**: the unauthenticated branch does `return NextResponse.json({ error: "Unauthorized" }, { status: 401 })` — invalid inside a Server Component page, which must return JSX or call a navigation function like `redirect()`/`notFound()`, not a `NextResponse`. Needs to become `redirect('/login')`, matching `app/(protected)/jobs/page.tsx`.
- `components/AddFormJob.tsx`: added `try/catch/finally`, captured the fetch response into `res`, branched on `res.ok`, and moved `router.refresh()`/`onClose()` into the success path (#3, mostly fixed). **Remaining gaps**: `error` is set on the failure path but still never rendered anywhere in the JSX, so failed submissions still show the user nothing; the `catch` block only does `console.error(...)` and never calls `setError`, so network failures are silent too.

**Not yet fixed**

- `components/ui/SendConcernsForm.tsx` (#4) — no error handling, no `res.ok` check, `Content-Type` typo still present.
- `app/api/auth/[...nextauth]/route.ts` (#5) — debug `console.log` calls still present in `authorize()`.
- `app/api/jobs/route.ts` / `app/api/concerns/route.ts` (#6) — `status as any` still unvalidated in both GET handlers.

**Next steps**

- Render the `error` state in `AddFormJob.tsx`'s JSX, and call `setError` in the `catch` block so network failures surface too.
- Swap the `NextResponse.json` 401 in `jobs/[id]/page.tsx` for `redirect('/login')`.
- Apply the same try/catch + `res.ok` + error-display pattern to `SendConcernsForm.tsx`; fix its `Content-Type` header.
- Remove the `console.log` calls from the NextAuth `authorize()` function.
- Validate `status` against the Prisma enum (`ApplicationStatus` / `ConcernStatus`) in both GET routes instead of casting `as any`.