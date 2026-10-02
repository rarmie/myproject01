---
date: 2026-10-02
status: accepted
---

# 0001: Job detail stays on /jobs, selected through the URL

## Context

The 7 Sept redesign ([[2026-09-08-jobs-board-redesign]]) put a list and a detail pane side by side
on `/jobs`, in `components/JobsBoard.tsx`. The selected job was held in React state (`useState`),
so it was not in the URL. A job could not be linked to, a refresh lost the selection, and the back
button skipped over it. The whole board was a client component.

The 12 Sept plan fixed this by moving detail to its own route, `/jobs/[id]`, and turning `/jobs`
into a plain list. Once the merged groundwork was in place, it became clear that a plain list leaves
most of a wide screen empty.

## Decision

Keep the list and detail on one page, using layout A
([[2026-10-02-jobs-layout-wide-detail]]): a narrow grouped list on the left, and a detail pane that
fills the rest of the width, split into two columns.

The selected job lives in the URL as `/jobs?job=<id>`. The page is a server component. It reads
`job` from `searchParams`, like `search` and `status`. It loads that one job with `userId` in the
`where`, and renders the detail on the server. List rows are plain links. Only the controls that
change data (quick status, edit, delete) are client components.

`/jobs/[id]` stays as a redirect to `/jobs?job=<id>`, so existing links keep working.

The list's status groups are an accordion ([[2026-10-02-jobs-list-accordion]]): one group open at
a time, starting with the selected job's group. All five statuses always get a group, even with no
jobs, and each header shows a count. All group headers stay visible, and the open group fills the space between them
and scrolls. It uses `<details name="…">`, which the browser makes exclusive, so the list stays a
server component with no JavaScript.

## Alternatives considered

- **Separate `/jobs/[id]` page** (the 12 Sept plan). It's simple, but it leaves the list page mostly
  empty, and moving between jobs means going back and forth.
- **Full-width table with a slide-over drawer** (layout B). It's the best for comparing jobs, but
  it's the most new work, and the drawer hides part of the table.
- **Three panes with a status rail** (layout C). It squeezes the detail on a laptop screen and
  repeats the dashboard's counts.

## Consequences

- Links, refresh and the back button work, because the selection is in the URL.
- The list no longer needs `contacts` and `documents` for every job. Only the selected job loads
  them.
- List links must keep the current `search` and `status` params when they set `job`.
- `JobsBoard.tsx` is deleted. Its markup is split into server-rendered list and detail components.
- On a phone there is no room for both panes. The page shows the list without `?job`, and only the
  detail with it.
