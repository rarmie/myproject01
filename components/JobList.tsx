import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ApplicationStatus } from '@/lib/generated/prisma/enums'
import { STATUS_DOT, STATUS_LABEL, STATUS_ORDER, companyInitial } from '@/lib/job-status'

export type JobListItem = {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  salary: string | null
}

// Selecting a job sets ?job= but keeps the current search and status filters.
function jobHref(id: string, search?: string, status?: string): string {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  params.set('job', id)
  return `/jobs?${params.toString()}`
}

// Status groups are an accordion built on <details>, so this stays a server component.
// - The shared name makes it exclusive: the browser closes the open group when another opens.
// - The selected job's group starts open. If that job isn't in the list (a filter hides it),
//   the first non-empty group does.
//   With no jobs at all, Applied (the first group) opens and shows an empty message.
// - Headers never shrink, so all of them stay visible. The open group fills the space between
//   them and scrolls its rows. If even that doesn't fit, the whole list scrolls.
export default function JobList({
  jobs,
  selectedId,
  search,
  status,
}: {
  jobs: JobListItem[]
  selectedId?: string
  search?: string
  status?: string
}) {
  // Every status gets a group, even with no jobs, so the five headers never move around.
  const groups = STATUS_ORDER.map((groupStatus) => ({
    status: groupStatus,
    jobs: jobs.filter((j) => j.status === groupStatus),
  }))

  const openStatus =
    jobs.find((j) => j.id === selectedId)?.status ??
    groups.find((g) => g.jobs.length > 0)?.status ??
    groups[0].status

  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto p-2">
      {groups.map((group) => (
        <details
          key={group.status}
          name="job-status-groups"
          open={group.status === openStatus}
          className="group flex min-h-0 shrink-0 flex-col open:min-h-17 open:flex-1 open:shrink [&[open]::details-content]:contents"
        >
          <summary className="flex shrink-0 cursor-pointer list-none items-center gap-2.5 rounded-md px-2 py-2.5 select-none hover:bg-accent/50 [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
            <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[group.status]}`} />
            <span className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">
              {STATUS_LABEL[group.status]}
            </span>
            <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {group.jobs.length}
            </span>
          </summary>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {group.jobs.length === 0 && (
              <p className="py-2 pr-2 pl-8 text-sm text-muted-foreground">No applications here.</p>
            )}
            {group.jobs.map((job) => (
              <Link
                key={job.id}
                href={jobHref(job.id, search, status)}
                aria-current={job.id === selectedId ? 'page' : undefined}
                className={`flex items-start gap-3 rounded-lg py-2.5 pr-2 pl-8 transition-colors ${
                  job.id === selectedId ? 'bg-accent' : 'hover:bg-accent/50'
                } ${job.status === 'REJECTED' ? 'opacity-60' : ''}`}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-foreground">
                  {companyInitial(job.company)}
                </div>
                {/* Text wraps instead of truncating, so nothing is cut off; salary gets its own line. */}
                <div className="min-w-0 flex-1 wrap-anywhere">
                  <div className="text-[15px] leading-snug font-medium text-foreground">{job.company}</div>
                  <div className="text-[13px] leading-snug text-muted-foreground">{job.role}</div>
                  {job.salary && (
                    <div className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">{job.salary}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
