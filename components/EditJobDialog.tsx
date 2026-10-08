'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApplicationStatus } from '@/lib/generated/prisma/enums'
import { PIPELINE_ORDER, STATUS_LABEL } from '@/lib/job-status'
import { messageFromResponse } from '@/lib/api-error'

const STATUS_OPTIONS: ApplicationStatus[] = [...PIPELINE_ORDER, 'REJECTED']

// Mirrors the PATCH schema in app/api/jobs/[id]/route.ts. The two are separate definitions,
// so a change to one needs the other.
const editSchema = z.object({
  company: z.string().trim().min(1, 'Company is required'),
  role: z.string().trim().min(1, 'Role is required'),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  link: z.union([z.url('Enter a full URL, starting with https://'), z.literal('')]),
  salary: z.string(),
  notes: z.string(),
  appliedAt: z.string().min(1, 'Applied date is required'),
  requirements: z.string(),
})

type EditFormData = z.infer<typeof editSchema>

export type EditableJob = {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  link: string | null
  salary: string | null
  notes: string | null
  requirements: string[]
  appliedAt: string // ISO string; Dates are converted on the server
}

export default function EditJobDialog({ job }: { job: EditableJob }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {job.company}</DialogTitle>
        </DialogHeader>
        {/* DialogContent unmounts when closed, so each open re-seeds the form from fresh props. */}
        <EditJobForm job={job} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditJobForm({ job, onClose }: { job: EditableJob; onClose: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      company: job.company,
      role: job.role,
      status: job.status,
      link: job.link ?? '',
      salary: job.salary ?? '',
      notes: job.notes ?? '',
      appliedAt: job.appliedAt.slice(0, 10), // yyyy-MM-dd for the date input
      requirements: job.requirements.join('\n'),
    },
  })

  const onSubmit = async (data: EditFormData) => {
    setLoading(true)
    setError(null)

    const payload = {
      ...data,
      requirements: data.requirements
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const message = await messageFromResponse(res)
      if (message) {
        setError(message)
        return
      }

      // Without ?job the page shows its default (top) job. A status edit can move this job
      // out of that spot, so pin it in the URL first or the pane would switch jobs.
      if (searchParams.has('job')) {
        router.refresh()
      } else {
        const params = new URLSearchParams(searchParams.toString())
        params.set('job', job.id)
        router.replace(`/jobs?${params.toString()}`, { scroll: false })
      }
      onClose()
    } catch (err) {
      console.error('Job update failed.', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-company">Company</label>
          <Input id="edit-company" {...register('company')} />
          {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-role">Role</label>
          <Input id="edit-role" {...register('role')} />
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <Select
            defaultValue={job.status}
            onValueChange={(val) => setValue('status', val as EditFormData['status'])}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-applied">Applied</label>
          <Input id="edit-applied" type="date" {...register('appliedAt')} />
          {errors.appliedAt && <p className="text-red-500 text-sm">{errors.appliedAt.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-salary">Salary</label>
          <Input id="edit-salary" placeholder="Salary (optional)" {...register('salary')} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-link">Job link</label>
          <Input id="edit-link" placeholder="https://... (optional)" {...register('link')} />
          {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="edit-notes">Notes</label>
          <Textarea id="edit-notes" className="h-20 max-h-20" placeholder="Notes (optional)" {...register('notes')} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="edit-requirements">Requirements</label>
          <Textarea
            id="edit-requirements"
            className="h-28 max-h-28"
            placeholder="One per line"
            {...register('requirements')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
