'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  link: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export default function AddJobForm({onClose}: {onClose: () => void}) {
  const router = useRouter()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: 'APPLIED' },
  })

  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const onSubmit = async (data: JobFormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      {error && (
        <p className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Company</label>
        <Input placeholder="Company" {...register('company')} />
        {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Role</label>
        <Input placeholder="Role" {...register('role')} />
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Status</label>
        <Select onValueChange={(val) => setValue('status', val as JobFormData['status'])} defaultValue="APPLIED">
          <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Job link</label>
        <Input placeholder="https://... (optional)" {...register('link')} />
        {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Salary</label>
        <Input placeholder="Salary (optional)" {...register('salary')} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notes</label>
        <Input placeholder="Notes (optional)" {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving application...' : 'Save'}</Button>
    </form>
  )
}
