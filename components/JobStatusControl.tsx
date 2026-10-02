'use client'
import { useState } from 'react'
import { useRouter,  useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApplicationStatus } from '@/lib/generated/prisma/enums'
import { PIPELINE_ORDER, STATUS_BADGE, STATUS_LABEL } from '@/lib/job-status'
import { messageFromResponse } from '@/lib/api-error'

const OPTIONS: ApplicationStatus[] = [...PIPELINE_ORDER, 'REJECTED']

// Quick status change. Local state makes the trigger show the new value straight away;
// router.refresh() then brings the server-rendered prop into agreement. The parent keys this
// component on job id + status, so it re-seeds when either changes from elsewhere.
export default function JobStatusControl({ jobId, status }: { jobId: string; status: ApplicationStatus }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(status)
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (next: string) => {
    const nextStatus = next as ApplicationStatus
    const previous = value
    setValue(nextStatus)
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      const message = await messageFromResponse(res)
      if (message) {
        setValue(previous)
        setError(message)
        return
      }

      if (searchParams.has('job')){
        router.refresh()
      }else{
        const params = new URLSearchParams(searchParams.toString())
        params.set('job', jobId)
        router.replace(`/jobs?${params.toString()}`, { scroll: false })
      }

    } catch (err) {
      console.error('Status update failed.', err)
      setValue(previous)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select value={value} onValueChange={handleChange} disabled={isSaving}>
        <SelectTrigger size="sm" aria-label="Status" className={`border-transparent font-semibold ${STATUS_BADGE[value]}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
