'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  link: z.string().url().optional().or(z.literal('')),
  salary: z.string().optional(),
  notes: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export default function AddJobForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: 'APPLIED' },
  })

  const onSubmit = async (data: JobFormData) => {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    window.location.reload()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add Job</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Company" {...register('company')} />
          {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
          <Input placeholder="Role" {...register('role')} />
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          <Select onValueChange={(val) => setValue('status', val as any)} defaultValue="APPLIED">
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {['WISHLIST', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Job link (optional)" {...register('link')} />
          <Input placeholder="Salary (optional)" {...register('salary')} />
          <Input placeholder="Notes (optional)" {...register('notes')} />
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}