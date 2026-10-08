'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose, DialogFooter } from '@/components/ui/dialog'
import FormField from '@/components/FormField'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { ApplicationStatus } from '@/lib/generated/prisma/enums'
import { PIPELINE_ORDER, STATUS_DOT, STATUS_LABEL } from '@/lib/job-status'

const STATUS_OPTIONS: ApplicationStatus[] = [...PIPELINE_ORDER, 'REJECTED']

const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  link: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  notes: z.string().optional(),
  requirements: z.string().optional()
})

type JobFormData = z.infer<typeof jobSchema>

export default function AddJobForm({onClose}: {onClose: () => void}) {
  const router = useRouter()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: 'APPLIED' },
  })

  const [pasteText, setPasteText] = useState('')
  const [isExtracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const trimmedPastedText = pasteText.trim().length

  function setHint(){
    if (trimmedPastedText < 20){
      return "Paste at least 20 characters."
    }

    if (trimmedPastedText > 50_000){
      return "Pasted text exceeds the maximum amount of characters."
    }
  }

  const handleExtract = async () => {
    setExtracting(true)
    setExtractError(null)

    try {
    const res = await fetch('/api/jobs/extract', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text: pasteText})
    })

    if (!res.ok){
      const data = await res.json().catch(() => null)
      setExtractError(typeof data?.error === 'string' ? data.error : 'Extraction failed.')
      return
    }

    const extracted = await res.json()
    if (extracted.company) setValue('company', extracted.company)
    if (extracted.role) setValue('role', extracted.role)
    if (extracted.salary) setValue('salary', extracted.salary)
    if (extracted.link) setValue('link', extracted.link)
    if (extracted.requirements) setValue('requirements', extracted.requirements.join("\n"))

    } catch (err) {
      console.error('Extraction failed.', err)
      setExtractError('Something went wrong, Please try again.')

    } finally {
      setExtracting(false)
    }
  }
  
  const onSubmit = async (data: JobFormData) => {
    setLoading(true)
    setError(null)

    const payload = {
      ...data,
      requirements: (data.requirements ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = typeof data?.error === "string" ? data.error : "Please check the form and try again."

        setError(message)
        return
      }

      router.refresh()
      onClose()
    }
    catch (err) {
      console.error("Job submission failed.", err)
      setError("Something went wrong. Please try again.")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* AI autofill: its own dashed panel, so it reads as optional and separate from the fields. */}
      <div className="rounded-xl border border-dashed border-input bg-muted/40 p-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="size-4" />
          </span>
          <div>
            <label htmlFor="add-paste" className="text-sm font-semibold">Autofill from a job posting</label>
            <p className="text-xs text-muted-foreground">
              Paste the posting text and we&apos;ll pull out the company, role, salary and requirements.
            </p>
          </div>
        </div>
        <Textarea
          id="add-paste"
          className='h-20 max-h-20 bg-background'
          placeholder="Paste the job description here..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={4}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {setHint()}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExtracting || trimmedPastedText < 20 || trimmedPastedText > 50_000}
            onClick={handleExtract}
          >
            {isExtracting ? 'Extracting...' : 'Extract details'}
          </Button>
        </div>
        {extractError && (
          <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
            {extractError}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
          {error}
        </p>
      )}

      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Details</div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <FormField id="add-company" label="Company" required error={errors.company?.message}>
          <Input
            id="add-company"
            placeholder="e.g. Stripe"
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'add-company-error' : undefined}
            {...register('company')}
          />
        </FormField>

        <FormField id="add-role" label="Role" required error={errors.role?.message}>
          <Input
            id="add-role"
            placeholder="e.g. Backend Engineer"
            aria-invalid={!!errors.role}
            aria-describedby={errors.role ? 'add-role-error' : undefined}
            {...register('role')}
          />
        </FormField>

        <FormField id="add-status" label="Status">
          <Select onValueChange={(val) => setValue('status', val as JobFormData['status'])} defaultValue="APPLIED">
            <SelectTrigger id="add-status" className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[s]}`} />
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="add-salary" label="Salary" optional>
          <Input id="add-salary" placeholder="e.g. $120k – $150k" {...register('salary')} />
        </FormField>

        <FormField id="add-link" label="Job link" optional error={errors.link?.message} className="sm:col-span-2">
          <Input
            id="add-link"
            placeholder="https://..."
            aria-invalid={!!errors.link}
            aria-describedby={errors.link ? 'add-link-error' : undefined}
            {...register('link')}
          />
        </FormField>

        <FormField id="add-notes" label="Notes" optional className="sm:col-span-2">
          <Input id="add-notes" placeholder="Referral, recruiter name, anything to remember" {...register('notes')} />
        </FormField>

        <FormField id="add-requirements" label="Requirements" optional hint="One per line." className="sm:col-span-2">
          <Textarea
            id="add-requirements"
            className='h-28 max-h-28'
            placeholder={'Go or Java\nPostgreSQL'}
            {...register('requirements')}
          />
        </FormField>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save application'}</Button>
      </DialogFooter>
    </form>
  )
}
