'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

type Contact = { id: string; name: string; email: string | null }
type JobDocument = { id: string; label: string; fileUrl: string }
type Status = 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED'

type Job = {
  id: string
  company: string
  role: string
  status: Status
  salary: string | null
  link: string | null
  notes: string | null
  appliedAt: Date
  contacts: Contact[]
  documents: JobDocument[]
}

const GROUPS: { status: Status; label: string; dot: string }[] = [
  { status: 'APPLIED', label: 'Applied', dot: 'bg-primary' },
  { status: 'INTERVIEW', label: 'Interview', dot: 'bg-yellow-500' },
  { status: 'OFFER', label: 'Offer', dot: 'bg-green-500' },
  { status: 'WISHLIST', label: 'Wishlist', dot: 'bg-zinc-400' },
  { status: 'REJECTED', label: 'Rejected', dot: 'bg-red-500' },
]

const STEP_ORDER: Status[] = ['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER']

const STATUS_BADGE: Record<Status, string> = {
  WISHLIST: 'bg-muted text-muted-foreground',
  APPLIED: 'bg-accent text-accent-foreground',
  INTERVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400',
  OFFER: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
}

function initial(company: string) {
  return company.trim().charAt(0).toUpperCase() || '?'
}

export default function JobsBoard({ jobs }: { jobs: Job[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(jobs[0]?.id ?? null)
  const selected = useMemo(() => jobs.find((j) => j.id === selectedId) ?? null, [jobs, selectedId])

  if (jobs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-muted-foreground text-sm">No applications match your filters yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-h-0 border-t">
      <div className="w-full sm:w-80 shrink-0 border-r overflow-y-auto p-2">
        {GROUPS.map(({ status, label, dot }) => {
          const groupJobs = jobs.filter((j) => j.status === status)
          if (groupJobs.length === 0) return null

          return (
            <div key={status}>
              <div className="flex items-center gap-2 px-2 pt-3 pb-1.5">
                <span className={`size-1.5 rounded-full ${dot}`} />
                <span className="text-[10.5px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {label}
                </span>
                <span className="ms-auto text-[10.5px] text-muted-foreground">{groupJobs.length}</span>
              </div>
              {groupJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                    job.id === selectedId ? 'bg-accent' : 'hover:bg-accent/50'
                  } ${job.status === 'REJECTED' ? 'opacity-60' : ''}`}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground">
                    {initial(job.company)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{job.company}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{job.role}</div>
                  </div>
                  {job.salary && (
                    <div className="ms-auto text-[11px] text-muted-foreground tabular-nums shrink-0">{job.salary}</div>
                  )}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-base font-bold text-foreground">
                {initial(selected.company)}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{selected.company}</h1>
                <p className="text-sm text-muted-foreground">{selected.role}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full ${STATUS_BADGE[selected.status]}`}>
              {selected.status}
            </span>
          </div>

          {selected.status !== 'REJECTED' && (
            <div className="flex items-center gap-1.5 my-6">
              {STEP_ORDER.map((step, i) => {
                const currentIdx = STEP_ORDER.indexOf(selected.status)
                const done = i <= currentIdx
                return <div key={step} className={`flex-1 h-1 rounded-full ${done ? 'bg-primary' : 'bg-muted'}`} />
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Salary</div>
              <div className="text-sm font-medium text-foreground">{selected.salary ?? 'N/A'}</div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Applied</div>
              <div className="text-sm font-medium text-foreground">{new Date(selected.appliedAt).toLocaleDateString()}</div>
            </div>
            <div className="rounded-lg border bg-card p-3 col-span-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Link</div>
              <div className="text-sm font-medium text-foreground">
                {selected.link ? <a href={selected.link} className="text-primary hover:underline">{selected.link}</a> : 'N/A'}
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-6 mb-2">Notes</div>
          <div className="rounded-lg border bg-card p-3 text-sm text-foreground/90">
            {selected.notes ?? 'No notes yet.'}
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-6 mb-2">Contacts</div>
          {selected.contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selected.contacts.map((c) => (
                <div key={c.id} className="rounded-lg border bg-card p-3 text-sm">{c.name} — {c.email}</div>
              ))}
            </div>
          )}

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-6 mb-2">Documents</div>
          {selected.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selected.documents.map((d) => (
                <div key={d.id} className="rounded-lg border bg-card p-3 text-sm">
                  <a href={d.fileUrl} className="text-primary hover:underline">{d.label}</a>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/jobs/${selected.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-8"
          >
            Open full page <ExternalLink className="size-3" />
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Select an application to see details
        </div>
      )}
    </div>
  )
}
